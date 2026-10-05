"""
Astronaut Health Telemetry Compute Engine (Python).
Calculates personal baselines, rolling statistics, z-scores,
and evaluates multi-signal health alert rules.
"""

import math
from typing import List, Dict, Any, Optional

SIGNAL_KEYS = [
    "heart_rate",
    "hrv",
    "spo2",
    "sleep_hours",
    "core_temperature",
    "exercise_minutes",
]

DEFAULT_BASELINE_WINDOW = 96
DEFAULT_Z_THRESHOLD = 3.0
DEFAULT_MULTI_SIGNAL_WINDOW_S = 48 * 3600  # or demo window equivalent

class Baseline:
    def __init__(self, mean: float, std: float, lower: float, upper: float):
        self.mean = mean
        self.std = std
        self.lower = lower
        self.upper = upper

    def to_dict(self) -> Dict[str, float]:
        return {
            "mean": round(self.mean, 2),
            "std": round(self.std, 3),
            "lower": round(self.lower, 2),
            "upper": round(self.upper, 2),
        }

def compute_baseline(values: List[float], threshold: float = DEFAULT_Z_THRESHOLD) -> Baseline:
    n = len(values)
    if n == 0:
        return Baseline(0.0, 0.0, 0.0, 0.0)
    mean = sum(values) / n
    variance = sum((x - mean) ** 2 for x in values) / max(1, n - 1)
    std = math.sqrt(variance)
    return Baseline(
        mean=mean,
        std=std,
        lower=mean - threshold * std,
        upper=mean + threshold * std,
    )

def z_score(value: float, baseline: Baseline) -> float:
    if baseline.std == 0:
        return 0.0
    return (value - baseline.mean) / baseline.std

def rolling_baseline(
    series: List[Dict[str, Any]],
    key: str,
    index: int,
    window: int = DEFAULT_BASELINE_WINDOW,
    threshold: float = DEFAULT_Z_THRESHOLD,
) -> Baseline:
    start = max(0, index - window)
    values = [series[i][key] for i in range(start, index) if key in series[i]]
    return compute_baseline(values, threshold)

def detect_alerts_up_to(
    series: List[Dict[str, Any]],
    current_index: int,
    baseline_window: int = 60,
    threshold: float = DEFAULT_Z_THRESHOLD,
) -> List[Dict[str, Any]]:
    """
    Evaluates rolling baselines, z-scores, and multi-signal rules up to current_index.
    """
    alerts = []
    active_deviations: Dict[str, bool] = {}
    recent_deviations: List[Dict[str, Any]] = []
    counter = 0

    start_idx = max(1, min(baseline_window, current_index))
    for i in range(start_idx, min(current_index + 1, len(series))):
        sample = series[i]
        sample_time = sample.get("timestamp", "")
        
        # Check all signals for deviations
        deviated_this_sample = []
        for key in SIGNAL_KEYS:
            b = rolling_baseline(series, key, i, window=baseline_window, threshold=threshold)
            val = sample[key]
            z = z_score(val, b)
            is_dev = abs(z) >= threshold

            if is_dev and not active_deviations.get(key, False):
                active_deviations[key] = True
                dev_info = {
                    "signal": key,
                    "value": val,
                    "baseline_mean": round(b.mean, 2),
                    "baseline_std": round(b.std, 3),
                    "z_score": round(z, 2),
                }
                deviated_this_sample.append(dev_info)
                recent_deviations.append({"signal": key, "index": i, "dev": dev_info})
            elif not is_dev:
                active_deviations[key] = False

        if deviated_this_sample:
            # Check multi-signal rule: 2 or more distinct signals deviated recently
            recent_within_window = [
                d for d in recent_deviations if i - d["index"] <= 60 # within 60s / window
            ]
            distinct_signals = {d["signal"]: d["dev"] for d in recent_within_window}

            counter += 1
            if len(distinct_signals) >= 2:
                alerts.append({
                    "alert_id": f"ALT-{str(counter).zfill(3)}",
                    "index": i,
                    "timestamp": sample_time,
                    "rule": "MULTI_SIGNAL_ANOMALY",
                    "status": "MULTI-SIGNAL",
                    "signals": list(distinct_signals.values()),
                    "threshold": threshold,
                    "message": f"Multi-signal anomaly detected across {len(distinct_signals)} signals: {', '.join(distinct_signals.keys())}",
                })
            else:
                alerts.append({
                    "alert_id": f"ALT-{str(counter).zfill(3)}",
                    "index": i,
                    "timestamp": sample_time,
                    "rule": "Z_SCORE_DEVIATION",
                    "status": "DEVIATION",
                    "signals": deviated_this_sample,
                    "threshold": threshold,
                    "message": f"Single signal deviation detected: {deviated_this_sample[0]['signal']} (z={deviated_this_sample[0]['z_score']})",
                })

    return list(reversed(alerts))
