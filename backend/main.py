"""
Astro-Well-Guide: Production-Quality FastAPI Backend & Telemetry Streamer.
- OSDR Metadata Cache endpoints
- 600-sample Deterministic Vitals Fixture provider
- Real-time WebSocket Replay engine with playback controls
- Real-time Detector (Personal Baseline + Z-score + Multi-signal Rule)
"""

import asyncio
import json
import os
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .compute import (
    SIGNAL_KEYS,
    compute_baseline,
    rolling_baseline,
    z_score,
    detect_alerts_up_to,
)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OSDR_DIR = os.path.join(BASE_DIR, "data", "osdr", "studies")
FIXTURE_PATH = os.path.join(BASE_DIR, "data", "fixtures", "vitals.json")

app = FastAPI(
    title="NASA Astronaut Telemetry & OSDR Cache API",
    version="1.0.0",
    description="Production-grade OSDR metadata cache, deterministic vitals fixture and real-time telemetry replay.",
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory cached dataset
_vitals_fixture: List[Dict[str, Any]] = []

def load_vitals() -> List[Dict[str, Any]]:
    global _vitals_fixture
    if not _vitals_fixture:
        if os.path.exists(FIXTURE_PATH):
            with open(FIXTURE_PATH, "r", encoding="utf-8") as f:
                _vitals_fixture = json.load(f)
        else:
            raise RuntimeError(f"Fixture file not found at {FIXTURE_PATH}. Run scripts/generate_fixtures.py first.")
    return _vitals_fixture

@app.on_event("startup")
async def startup_event():
    load_vitals()
    print(f"Loaded {len(_vitals_fixture)} vitals rows from fixture into memory.")

@app.get("/", response_class=HTMLResponse)
def root_page():
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>NASA Astro-Well-Guide Telemetry & OSDR API</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0b0f17; color: #e2e8f0; margin: 0; padding: 40px 20px; }
        .container { max-width: 760px; margin: 0 auto; background: #131b2b; border: 1px solid #1e293b; border-radius: 12px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
        h1 { margin-top: 0; color: #38bdf8; font-size: 24px; display: flex; align-items: center; gap: 10px; }
        .badge { display: inline-block; background: #0369a1; color: #fff; font-size: 11px; padding: 3px 8px; border-radius: 9999px; text-transform: uppercase; font-weight: bold; }
        p { color: #94a3b8; font-size: 14px; line-height: 1.6; }
        .card { background: #0f172a; border: 1px solid #1e293b; border-radius: 8px; padding: 16px; margin: 16px 0; }
        .card h3 { margin: 0 0 10px 0; font-size: 14px; color: #f8fafc; text-transform: uppercase; letter-spacing: 0.05em; }
        ul { list-style: none; padding: 0; margin: 0; }
        li { margin: 8px 0; display: flex; justify-content: space-between; align-items: center; font-size: 13px; }
        a { color: #38bdf8; text-decoration: none; font-weight: 500; }
        a:hover { text-decoration: underline; }
        .method { background: #0284c7; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; margin-right: 6px; }
        .ws { background: #7c3aed; }
        .status-pill { background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3); padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h1>🚀 Astro-Well-Guide Telemetry Backend <span class="badge">v1.0.0</span></h1>
          <span class="status-pill">● System Healthy</span>
        </div>
        <p>Production-grade NASA OSDR metadata cache, 600-sample deterministic vitals fixture, and real-time biometric streaming server.</p>

        <div class="card">
          <h3>Interactive Documentation</h3>
          <ul>
            <li>
              <span><span class="method">DOCS</span> Swagger UI:</span>
              <a href="/docs" target="_blank">Open /docs &rarr;</a>
            </li>
            <li>
              <span><span class="method">DOCS</span> ReDoc Specification:</span>
              <a href="/redoc" target="_blank">Open /redoc &rarr;</a>
            </li>
          </ul>
        </div>

        <div class="card">
          <h3>NASA OSDR Metadata Cache Endpoints</h3>
          <ul>
            <li>
              <span><span class="method">GET</span> /api/osdr/studies</span>
              <a href="/api/osdr/studies" target="_blank">View All Cached Studies &rarr;</a>
            </li>
            <li>
              <span><span class="method">GET</span> /api/osdr/studies/OSD-258</span>
              <a href="/api/osdr/studies/OSD-258" target="_blank">Cardiovascular Study (OSD-258) &rarr;</a>
            </li>
          </ul>
        </div>

        <div class="card">
          <h3>Deterministic Vitals Fixture (Seed 42, 600s)</h3>
          <ul>
            <li>
              <span><span class="method">GET</span> /api/vitals/stats</span>
              <a href="/api/vitals/stats" target="_blank">Fixture Statistics &rarr;</a>
            </li>
            <li>
              <span><span class="method">GET</span> /api/vitals (Full 600 rows)</span>
              <a href="/api/vitals" target="_blank">View Fixture Samples &rarr;</a>
            </li>
            <li>
              <span><span class="method">GET</span> /api/detect?index=450 (Planted Anomaly @ 07:30)</span>
              <a href="/api/detect?index=450" target="_blank">Test Anomaly Trigger &rarr;</a>
            </li>
            <li>
              <span><span class="method ws">WS</span> /ws/vitals (1 row/sec replay)</span>
              <code style="color:#a78bfa;">ws://127.0.0.1:8000/ws/vitals</code>
            </li>
          </ul>
        </div>
      </div>
    </body>
    </html>
    """

@app.get("/favicon.ico")
def favicon():
    return Response(status_code=204)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": "Astro-Well-Guide Telemetry Backend",
        "osdr_cached": os.path.exists(os.path.join(OSDR_DIR, "index.json")),
        "fixture_loaded": len(_vitals_fixture) == 600,
        "total_samples": len(_vitals_fixture),
    }

# -----------------------------------------------------------------------------
# OSDR Metadata Cache Endpoints
# -----------------------------------------------------------------------------

@app.get("/api/osdr/studies")
def list_osdr_studies():
    """Returns cached list of NASA OSDR studies."""
    index_file = os.path.join(OSDR_DIR, "index.json")
    if os.path.exists(index_file):
        with open(index_file, "r", encoding="utf-8") as f:
            return json.load(f)
    raise HTTPException(status_code=404, detail="OSDR index cache not found.")

@app.get("/api/osdr/studies/{study_id}")
def get_osdr_study(study_id: str):
    """Returns specific cached OSDR study metadata."""
    study_file = os.path.join(OSDR_DIR, f"{study_id}.json")
    if os.path.exists(study_file):
        with open(study_file, "r", encoding="utf-8") as f:
            return json.load(f)
    raise HTTPException(status_code=404, detail=f"OSDR study '{study_id}' not found in cache.")

# -----------------------------------------------------------------------------
# Vitals Fixture Endpoints
# -----------------------------------------------------------------------------

@app.get("/api/vitals")
def get_vitals(offset: int = 0, limit: int = 600):
    """Returns rows from the deterministic 600-sample vitals fixture."""
    vitals = load_vitals()
    return {
        "total": len(vitals),
        "offset": offset,
        "limit": limit,
        "samples": vitals[offset : offset + limit],
    }

@app.get("/api/vitals/stats")
def get_vitals_stats():
    """Returns fixture metadata and key beats."""
    vitals = load_vitals()
    return {
        "total_samples": len(vitals),
        "sample_rate_hz": 1,
        "duration_seconds": len(vitals),
        "duration_minutes": round(len(vitals) / 60, 1),
        "anomaly_index": 450,
        "anomaly_time_str": "07:30",
        "anomaly_beat": {
            "normal_phase": "00:00 - 07:29 (Indices 0 - 449)",
            "trigger": "07:30 (Index 450) - Multi-signal anomaly onset",
            "peak_deviation": "08:00 (Index 480)",
            "recovery_phase": "08:45 - 09:59 (Indices 525 - 599)",
        },
        "deterministic_seed": 42,
    }

@app.get("/api/vitals/{index}")
def get_vital_by_index(index: int):
    """Returns a single sample by its 0-599 index."""
    vitals = load_vitals()
    if 0 <= index < len(vitals):
        return vitals[index]
    raise HTTPException(status_code=404, detail=f"Sample index {index} out of range (0-599).")

@app.get("/api/detect")
def run_detector(index: int = 450, baseline_window: int = 60, threshold: float = 3.0):
    """Runs the personal baseline & multi-signal detector on the fixture up to specified index."""
    vitals = load_vitals()
    if not (0 <= index < len(vitals)):
        raise HTTPException(status_code=400, detail="Index out of bounds")
    
    current_sample = vitals[index]
    baselines = {}
    z_scores = {}
    deviating = []

    for key in SIGNAL_KEYS:
        b = rolling_baseline(vitals, key, index, window=baseline_window, threshold=threshold)
        baselines[key] = b.to_dict()
        val = current_sample[key]
        z = z_score(val, b)
        z_scores[key] = round(z, 2)
        if abs(z) >= threshold:
            deviating.append(key)

    alerts = detect_alerts_up_to(vitals, index, baseline_window=baseline_window, threshold=threshold)

    return {
        "index": index,
        "timestamp": current_sample["timestamp"],
        "sample": current_sample,
        "baselines": baselines,
        "z_scores": z_scores,
        "deviating_signals": deviating,
        "active_alerts": alerts,
    }

# -----------------------------------------------------------------------------
# WebSocket Replay Engine (1 row/sec with live commands)
# -----------------------------------------------------------------------------

@app.websocket("/ws/vitals")
async def websocket_vitals_stream(websocket: WebSocket):
    await websocket.accept()
    vitals = load_vitals()

    state = {
        "index": 0,
        "speed": 1.0,
        "paused": False,
        "baseline_window": 60,
        "threshold": 3.0,
    }

    async def incoming_listener():
        try:
            while True:
                msg = await websocket.receive_text()
                data = json.loads(msg)
                action = data.get("action")
                if action == "pause":
                    state["paused"] = True
                elif action == "play" or action == "resume":
                    state["paused"] = False
                elif action == "speed":
                    state["speed"] = max(0.1, min(20.0, float(data.get("value", 1.0))))
                elif action == "seek":
                    idx = int(data.get("index", 0))
                    state["index"] = max(0, min(len(vitals) - 1, idx))
                elif action == "jump_anomaly":
                    state["index"] = 450
        except WebSocketDisconnect:
            pass
        except Exception:
            pass

    listener_task = asyncio.create_task(incoming_listener())

    try:
        while True:
            idx = state["index"]
            sample = vitals[idx]

            # Compute real-time metrics
            baselines = {}
            z_scores = {}
            deviating = []
            for key in SIGNAL_KEYS:
                b = rolling_baseline(vitals, key, idx, window=state["baseline_window"], threshold=state["threshold"])
                baselines[key] = b.to_dict()
                val = sample[key]
                z = z_score(val, b)
                z_scores[key] = round(z, 2)
                if abs(z) >= state["threshold"]:
                    deviating.append(key)

            alerts = detect_alerts_up_to(
                vitals,
                idx,
                baseline_window=state["baseline_window"],
                threshold=state["threshold"],
            )

            payload = {
                "type": "vital_tick",
                "index": idx,
                "total": len(vitals),
                "is_anomaly_beat": (idx >= 450 and idx <= 540),
                "sample": sample,
                "baselines": baselines,
                "z_scores": z_scores,
                "deviating_signals": deviating,
                "alerts": alerts,
                "paused": state["paused"],
                "speed": state["speed"],
            }

            await websocket.send_text(json.dumps(payload))

            if not state["paused"]:
                state["index"] = (idx + 1) % len(vitals)

            delay = max(0.05, 1.0 / state["speed"])
            await asyncio.sleep(delay)

    except WebSocketDisconnect:
        pass
    finally:
        listener_task.cancel()
