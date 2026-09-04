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

<img width="1486" height="838" alt="Screenshot 2026-09-05 030703" src="https://github.com/user-attachments/assets/09497db2-601e-4cba-8862-f1577f9346a5" />

