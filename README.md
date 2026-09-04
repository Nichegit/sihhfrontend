# UrbanLens Frontend

UrbanLens is a React + TypeScript command-center frontend for an AI-powered mobile urban intelligence platform. It visualizes fleet telemetry, road conditions, traffic signals, incidents, infrastructure defects, and pedestrian-safety alerts.

## Run locally

```powershell
npm.cmd install
npm.cmd run dev
```

Open the local Vite URL, normally `http://localhost:5173`.

## Current mode

The app uses a centralized mock API so it is fully usable as a demo. Replace the mock implementation in `src/services/mockApi.ts` with FastAPI REST and WebSocket calls without changing UI components.

## Architecture

See [Architecture Handoff](outputs/ARCHITECTURE_HANDOFF.md) for the edge-AI, model-training, backend, storage, event schema, REST API, and WebSocket contracts.
