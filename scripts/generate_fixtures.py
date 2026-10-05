#!/usr/bin/env python3
"""
Generate deterministic vitals fixture.
- Exactly 600 rows (0 to 599) = 10 minutes at 1 row per second
- Deterministic with random.seed(42)
- Planted multi-signal anomaly starting at ANOMALY_INDEX = 450 (07:30)
- Fixture contains RAW vital measurements only (no precomputed alert fields)
"""

import json
import math
import os
import random
import shutil
from datetime import datetime, timedelta, timezone

TOTAL_ROWS = 600
ANOMALY_INDEX = 450
SEED = 42

BASE_TIMESTAMP = datetime(2026, 1, 1, 0, 0, 0, tzinfo=timezone.utc)

def generate_vitals_fixture():
    random.seed(SEED)

    # Initial states
    hr = 72.0
    hrv = 48.0
    spo2 = 98.0
    sleep_hours = 7.4
    core_temp = 36.80
    exercise_minutes = 24.0

    rows = []

    for i in range(TOTAL_ROWS):
        timestamp = (BASE_TIMESTAMP + timedelta(seconds=i)).strftime("%Y-%m-%dT%H:%M:%SZ")

        # Smooth gradual changes (AR(1) / bounded random walk)
        hr_drift = (random.random() - 0.5) * 0.9 + (71.5 - hr) * 0.08
        hr += hr_drift
        hr = max(68.0, min(75.0, hr))

        hrv_drift = (random.random() - 0.5) * 1.2 + (48.0 - hrv) * 0.08
        hrv += hrv_drift
        hrv = max(44.0, min(53.0, hrv))

        spo2_drift = (random.random() - 0.48) * 0.35 + (98.0 - spo2) * 0.1
        spo2 += spo2_drift
        spo2 = max(97.0, min(99.0, spo2))

        temp_drift = (random.random() - 0.5) * 0.02 + (36.80 - core_temp) * 0.05
        core_temp += temp_drift
        core_temp = max(36.72, min(36.88, core_temp))

        # Sleep & exercise change slowly over mission days
        sleep = round(sleep_hours + math.sin(i / 100.0) * 0.05, 1)
        exercise = int(exercise_minutes + (i // 60) * 0.1)

        # Planted Anomaly starting at index 450 (07:30 UTC)
        final_hr = hr
        final_hrv = hrv
        final_spo2 = spo2
        final_temp = core_temp

        if i >= ANOMALY_INDEX:
            progress = i - ANOMALY_INDEX
            # Anomaly triggers immediately at index 450 (07:30), peaks, and then recovers towards 599
            if progress < 8:
                # Immediate strong onset crossing Z-score threshold right away at 450
                ramp = 0.70 + (progress / 8.0) * 0.30
            elif progress < 85:
                ramp = 1.0 + (random.random() - 0.5) * 0.06
            else:
                recovery = (progress - 85) / (TOTAL_ROWS - ANOMALY_INDEX - 85)
                ramp = max(0.15, (1.0 - recovery * 0.85))

            # Apply significant deviations crossing z >= 3 threshold:
            # HR: +46 bpm (normal ~71 -> ~117-124 bpm)
            final_hr = hr + 46.0 * ramp + (random.random() - 0.5) * 2.0
            # HRV: -31 ms (normal ~48 -> ~15-18 ms)
            final_hrv = max(14.0, hrv - 31.0 * ramp + (random.random() - 0.5) * 1.5)
            # SpO2: -6.5% (normal ~98 -> ~91-92%)
            final_spo2 = max(90.5, spo2 - 6.5 * ramp + (random.random() - 0.5) * 0.4)
            # Core Temp: +1.35°C (normal ~36.8 -> ~38.1°C)
            final_temp = core_temp + 1.35 * ramp + (random.random() - 0.5) * 0.05

        row = {
            "index": i,
            "timestamp": timestamp,
            "heart_rate": round(final_hr),
            "hrv": round(final_hrv),
            "spo2": round(final_spo2),
            "sleep_hours": sleep,
            "core_temperature": round(final_temp, 1),
            "exercise_minutes": exercise,
        }
        rows.append(row)

    return rows

if __name__ == "__main__":
    vitals = generate_vitals_fixture()
    assert len(vitals) == 600, f"Expected exactly 600 rows, got {len(vitals)}"

    output_path = os.path.join("data", "fixtures", "vitals.json")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(vitals, f, indent=2)

    public_path = os.path.join("public", "data", "fixtures", "vitals.json")
    os.makedirs(os.path.dirname(public_path), exist_ok=True)
    shutil.copyfile(output_path, public_path)

    print(f"Generated {len(vitals)} rows in {output_path} and copied to {public_path}")
    print(f"Sample 0 (00:00): {vitals[0]}")
    print(f"Sample 449 (07:29): {vitals[449]}")
    print(f"Sample 450 (07:30 - Anomaly Trigger): {vitals[450]}")
    print(f"Sample 480 (08:00 - Anomaly Peak): {vitals[480]}")
    print(f"Sample 599 (09:59 - Recovery): {vitals[599]}")
