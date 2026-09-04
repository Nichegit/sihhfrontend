# UrbanLens — Engineering Architecture Handoff

## 1. Goal

Turn public transport buses into mobile sensing nodes. Bus-side software performs low-latency video analysis and sends compact detections, evidence references, and telemetry to a central platform. The central platform validates, aggregates, stores, and streams intelligence to the UrbanLens frontend.

The UI must never connect directly to YOLO, camera RTSP streams, or a database. It only talks to the FastAPI service through REST and WebSocket contracts.

```text
Bus cameras / GPS / CAN
        │
        ▼
Edge agent (capture, inference, tracking, buffer, uplink)
        │  HTTPS/MQTT + signed payloads
        ▼
Ingestion API ──► Queue ──► Processing / validation workers
        │                            │
        │                            ├── PostGIS + TimescaleDB
        │                            ├── Object storage (evidence)
        │                            └── Analytics / aggregation
        ▼
FastAPI REST + WebSocket gateway
        │
        ▼
React / TypeScript UrbanLens frontend
```

## 2. Components and ownership

| Layer | Owner | Responsibilities |
|---|---|---|
| Edge agent | Embedded / ML deployment team | Camera ingest, YOLO inference, tracking, GPS/time sync, evidence buffering, secure upload, retry/offline queue. |
| Models | Model training team | Train/evaluate/version detection, OCR/ANPR, tracking, classification, and severity models; export deployable artifacts. |
| Ingestion + processing | Backend team | Authenticate device, validate payloads, deduplicate, persist events, queue heavy work, expose services. |
| Data + analytics | Backend/data team | PostGIS spatial records, time-series telemetry, aggregates, OD and congestion calculations, retention. |
| Command frontend | Frontend team | Map, filters, detail panels, workflow states, reports, API client, real-time UI state. |

## 3. Edge-AI pipeline

### Inputs

- Front/rear/side/cabin RTSP or local camera feeds.
- GPS: `lat`, `lng`, `heading`, `speed_mps`, accuracy, timestamp.
- Vehicle identity: `bus_id`, `route_id`, `camera_id`, agent/software versions.

### Per-frame pipeline

```text
Frame → quality check → detector → tracker → event rules → evidence clip buffer
      → confidence/severity → event payload → local durable queue → upload
```

1. Use a monotonic device timestamp and GPS timestamp; synchronize device time with NTP/GNSS.
2. Run detector(s) at a configurable sampling rate; do not send raw continuous video.
3. Track objects across frames (`track_id`) so the same vehicle/pothole is not emitted repeatedly.
4. Event rules should aggregate multiple frames into one event: minimum confidence, minimum duration, spatial distance threshold, cooldown period.
5. Create a short evidence clip and/or image only for qualifying events. Upload it to object storage using a presigned URL returned by the backend.
6. Persist failed uploads and events locally; retry with exponential backoff. The edge agent must work when disconnected.

### Recommended model outputs

| Capability | Output |
|---|---|
| Road defects | class, bounding box/mask, confidence, road direction/lane if available |
| Traffic | vehicle class, count, track IDs, speed estimate, density estimate |
| Incident / rash driving | subject vehicle track ID, plate OCR candidates, speed/rule violation, clip |
| Pedestrian safety | person track ID, crossing zone, vulnerable-group indicator, risk score |
| Infrastructure | defect class: missing/damaged sign, divider, zebra crossing; confidence |

## 4. Model team deliverables

Every published model must ship with:

- Versioned model artifact, e.g. `road-defect-yolov8-1.4.0.onnx` or TensorRT engine.
- `model_manifest.json`: model name/version, SHA-256, input size, class labels, preprocessing, output schema, hardware requirements.
- Validation report by class: precision, recall, mAP, false-positive rate, benchmark hardware/FPS.
- Calibration recommendation and default acceptance thresholds by class.
- Sample inference payloads and at least 20 annotated regression images/clips.
- Rollback-compatible version number. The edge agent includes `model_version` in every detection.

### Model output contract (edge internal)

```json
{
  "model_name": "road-defect-yolov8",
  "model_version": "1.4.0",
  "frame_timestamp": "2026-09-05T10:42:18.230Z",
  "objects": [
    {
      "class": "pothole",
      "confidence": 0.94,
      "bbox_xyxy": [412, 290, 625, 452],
      "track_id": "trk_8f4a"
    }
  ]
}
```

Do not make the frontend dependent on model-specific class names. The backend maps them to stable platform event types.

## 5. Canonical platform event

This is the backend-to-frontend contract. All sources normalize to this shape.

```json
{
  "id": "EVT-260905-184",
  "type": "rash_driving",
  "category": "incident",
  "severity": "critical",
  "status": "new",
  "confidence": 0.96,
  "timestamp": "2026-09-05T10:42:18.230Z",
  "bus_id": "BUS-104",
  "camera_id": "FRONT-CAM",
  "route_id": "R-27",
  "location": { "lat": 28.629, "lng": 77.241, "address": "ITO Junction" },
  "summary": "Vehicle crossed red signal at speed; plate captured.",
  "model": { "name": "traffic-yolo", "version": "2.1.0" },
  "tracking": { "track_id": "trk_8f4a", "plate": "DL 3C AQ 4481", "plate_confidence": 0.91 },
  "evidence": {
    "image_url": "https://storage.example/evidence/EVT-260905-184.jpg",
    "video_url": "https://storage.example/evidence/EVT-260905-184.mp4",
    "expires_at": "2026-09-05T11:42:18Z"
  },
  "source_event_id": "edge-104-79aa",
  "created_at": "2026-09-05T10:42:21.900Z",
  "updated_at": "2026-09-05T10:42:21.900Z"
}
```

Stable values:

- `severity`: `critical | high | medium | low`
- `status`: `new | verified | resolved | rejected`
- `type`: use snake_case platform values such as `pothole`, `waterlogging`, `road_damage`, `traffic_congestion`, `rash_driving`, `pedestrian_safety`, `missing_signage`, `damaged_divider`, `missing_zebra_crossing`.

## 6. Backend API contract

Base URL: `/api/v1`. FastAPI must publish an OpenAPI schema at `/openapi.json`; generate the TypeScript API client from that schema where possible.

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/dashboard` | KPI cards, traffic series, recent events, fleet summary. |
| `GET` | `/events` | Paginated/filterable events: `type`, `severity`, `status`, `route_id`, `bus_id`, `from`, `to`, bounding box, search. |
| `GET` | `/events/{id}` | Full canonical event and evidence URLs. |
| `PATCH` | `/events/{id}/status` | Operator workflow action; body `{ "status": "verified" }`. |
| `GET` | `/fleet` | Current buses/camera health/last positions. |
| `GET` | `/fleet/{bus_id}/history` | Position/telemetry history for a time range. |
| `GET` | `/map/features` | GeoJSON features with server-side filters and bounding-box query. |
| `GET` | `/analytics/traffic` | Density, congestion, route-delay time series. |
| `GET` | `/analytics/road-condition` | Road-condition index / aggregated defect segments. |
| `GET` | `/reports` | Generated report metadata and download URLs. |
| `POST` | `/edge/events` | Device/edge ingestion; never called by the browser. |
| `POST` | `/edge/evidence-upload-url` | Returns a short-lived object-storage upload URL. |

### Status update request

```json
{ "status": "verified", "note": "Confirmed from evidence." }
```

Return the complete updated event, not only `200 OK`, so every client can reconcile state.

### Pagination response

```json
{
  "items": [],
  "next_cursor": "opaque-cursor-or-null",
  "total": 124,
  "applied_filters": { "status": ["new"] }
}
```

## 7. Real-time contract

WebSocket endpoint: `wss://<host>/api/v1/ws/operations`.

Authenticate with a short-lived bearer token during the WebSocket handshake. Client reconnects with exponential backoff and performs a REST refresh after reconnect.

Messages:

```json
{ "message_type": "event.created", "data": { "...canonical event": "..." } }
{ "message_type": "event.updated", "data": { "...canonical event": "..." } }
{ "message_type": "fleet.position", "data": { "bus_id": "BUS-104", "lat": 28.629, "lng": 77.241, "timestamp": "..." } }
{ "message_type": "fleet.health", "data": { "bus_id": "BUS-104", "status": "online", "camera_health": "healthy" } }
{ "message_type": "system.health", "data": { "ingestion": "healthy", "ai": "healthy" } }
```

Frontend rule: upsert `event.created`/`event.updated` by ID; do not append duplicates. For a sequence gap or reconnect, re-fetch `/events` and `/fleet`.

## 8. Data storage

| Store | Data |
|---|---|
| PostgreSQL + PostGIS | Events, event lifecycle, geospatial points/road segments, routes, users, audit trail. |
| TimescaleDB (Postgres extension) | Bus GPS, camera telemetry, traffic observations, model latency/FPS. |
| S3/MinIO object storage | Evidence images/videos; private bucket, short-lived signed URLs only. |
| Redis | WebSocket fan-out, cache, rate limiting, short-lived device state. |
| Queue: Kafka/RabbitMQ | Ingestion decoupling, inference post-processing, OCR, report/analytics jobs. |

Minimum event table fields: `id`, source id, event type, severity, confidence, workflow status, geometry point, bus/camera/route IDs, timestamps, model name/version, evidence object keys, created/updated audit fields.

## 9. Backend processing rules

- Idempotency key: `source_event_id` from edge. Repeated sends must not create duplicate events.
- Deduplicate same category within a configurable geospatial radius and time window; retain source observations.
- Severity is a server-side policy result, not only model output.
- Evidence access must be authorized and logged; serve signed URLs with short expiry.
- Run expensive OCR, route analytics, OD inference, and report generation in workers, never inside the ingestion request.
- Return timestamps as ISO-8601 UTC; frontend formats in the operator timezone.
- Return coordinates as WGS84 latitude/longitude. `GET /map/features` returns standard GeoJSON.

## 10. Frontend integration plan

The existing frontend boundary is:

```text
src/types.ts                 → UI data types
src/services/mockApi.ts      → replace with HTTP/WebSocket implementation
src/hooks/useUrbanData.ts    → shared loading/error/cache/realtime state
components + pages           → render contracts; should not contain fetch logic
```

### Required frontend changes when FastAPI is available

1. Keep the `UrbanEvent`, `FleetBus`, and `DashboardData` UI types stable; add a DTO mapper if API names are snake_case.
2. Replace mock methods with `fetch`/generated API-client calls, preserving `dashboard`, `updateEvent`, and `simulate` equivalents.
3. Add `WebSocket` subscription in the data hook/service and update the shared event/fleet store.
4. Use `GET /map/features?bbox=...` whenever Leaflet map bounds change; do not request the whole city repeatedly.
5. Use signed `evidence.image_url`/`video_url` only in the event detail UI.
6. Surface API errors as retryable UI state; never silently show stale data as live.

## 11. Security and reliability checklist

- TLS everywhere; device certificates or signed device JWTs for edge ingestion.
- Browser users authenticate via OAuth/OIDC or securely issued JWTs with role claims.
- Roles: `viewer`, `operator`, `supervisor`, `admin`; only authorized roles may reject/resolve events or view sensitive evidence.
- Audit every status change: actor, previous/new status, note, timestamp.
- Encrypt evidence and data at rest; redact or protect PII (plates/faces) according to policy.
- Rate-limit device endpoints; validate payload schema and coordinate bounds.
- Monitor: camera online %, event ingestion lag, queue lag, model latency/FPS, upload failure rate, API latency, WebSocket connections.

## 12. Recommended delivery order

1. Agree on canonical event JSON and OpenAPI definitions.
2. Deliver FastAPI mock endpoints matching that contract.
3. Connect frontend service to those endpoints; retain local mock-mode flag for demos.
4. Deploy edge event ingestion with one detector and GPS only.
5. Add object-storage evidence upload and operator workflow.
6. Add WebSocket updates, traffic aggregation, and map GeoJSON APIs.
7. Add OCR/ANPR, OD analytics, report generation, health monitoring, and role-based controls.

## Acceptance criteria for the handoff

- A model team sample event can be posted to `/edge/events` and appears on the map in under the agreed latency budget.
- Operator status changes are visible to a second browser via WebSocket.
- A duplicate edge payload does not create a duplicate map alert.
- Frontend works if no evidence URL exists, evidence expires, API is slow, or WebSocket reconnects.
- All front-end fields are sourced from API responses, not component hard-coding.
