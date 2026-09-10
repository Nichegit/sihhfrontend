# 🚍 UrbanLens — AI-Powered Mobile Urban Intelligence Platform

> Turning public transport buses into mobile AI-powered urban sensing platforms.

## 🎯 Problem Statement

Public buses travel through major roads every day and are equipped with multiple cameras.
However, these cameras are primarily used for recording incidents rather than continuously
analyzing urban road and traffic conditions.

This makes it difficult for authorities to quickly identify potholes, damaged roads,
traffic congestion, missing infrastructure, waterlogging, unsafe pedestrian situations,
and other road hazards.

## 💡 Proposed Solution

UrbanLens transforms public transport buses into mobile AI-powered sensing units.

Camera feeds from buses can be processed using Edge AI to detect road defects, vehicles,
traffic conditions, infrastructure issues and safety incidents.

Detected events are enriched with GPS coordinates and timestamps and sent to a centralized
urban intelligence platform where authorities can monitor, verify and analyze them.

## 🏗️ System Architecture

```text
Bus Cameras
     ↓
Edge AI / YOLO
     ↓
Object Detection & Tracking
     ↓
OCR / Event Detection
     ↓
GPS + Timestamp
     ↓
FastAPI Backend
     ↓
Database
     ↓
UrbanLens Dashboard
```


# UrbanLens Frontend

UrbanLens is a React + TypeScript command-center frontend for an AI-powered mobile urban intelligence platform. It visualizes fleet telemetry, road conditions, traffic signals, incidents, infrastructure defects, and pedestrian-safety alerts.

## Run locally

```powershell
npm.cmd install
npm.cmd run dev
```

Open the local Vite URL, normally `http://localhost:5173`.

## Live Delhi bus tracking

UrbanLens keeps the Delhi Open Transit Data API key on a FastAPI server. React never receives or exposes that key.

1. Obtain API access from Delhi Open Transit Data.
2. In `backend/`, copy `.env.example` to `.env` and set `DELHI_OTD_API_KEY` to your private OTD key. Do not commit this file.
3. Start the backend:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8010
```

4. In a second PowerShell window, start React from the project root:

```powershell
npm.cmd run dev
```

The frontend polls `GET http://localhost:5173/api/live-buses` every 10 seconds; Vite proxies it to FastAPI at `http://127.0.0.1:8010/api/live-buses`.

The map shows **LIVE BUS FEED** only after the backend has successfully returned OTD data. If the backend, key, or feed is unavailable, it safely remains in **DEMO BUS LOCATIONS** mode and continues to show the dashboard.

Security: `backend/.env` is ignored by Git. Keep the OTD key there only; never put it in React, Vite variables, screenshots, commits, or the GitHub repository.

## Current mode

The app uses a centralized mock API so it is fully usable as a demo. Replace the mock implementation in `src/services/mockApi.ts` with FastAPI REST and WebSocket calls without changing UI components.

## Architecture

See [Architecture Handoff](outputs/ARCHITECTURE_HANDOFF.md) for the edge-AI, model-training, backend, storage, event schema, REST API, and WebSocket contracts.

<img width="1486" height="838" alt="Screenshot 2026-09-05 030703" src="https://github.com/user-attachments/assets/09497db2-601e-4cba-8862-f1577f9346a5" />

