"""
Astronaut Health Telemetry Deterministic Compute Engine (Python).
Blueprint-compliant compute module:
- Deterministic personal baseline (rolling window Z-score >= 2.0σ / 3.0σ)
- Multi-signal anomaly detection (>= 2 signals deviating within window)
- Pure deterministic algorithms, strictly NO LLM inside compute boundary.
"""

import math
from typing import List, Dict, Any, Optional, Union

SIGNAL_KEYS = [
    "heart_rate",
    "hrv",
    "spo2",
    "sleep_hours",
    "core_temperature",
    "exercise_minutes",
]

PHYSIOLOGICAL_MIN_STD: Dict[str, float] = {
    "heart_rate": 2.0,
    "hrv": 2.0,
    "spo2": 0.8,
    "core_temperature": 0.1,
    "sleep_hours": 0.2,
    "exercise_minutes": 1.0,
}

DEFAULT_BASELINE_WINDOW = 60
DEFAULT_Z_THRESHOLD = 2.0
DEFAULT_MULTI_SIGNAL_WINDOW_S = 60  # seconds in fixture / 48 hours mission


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


def compute_baseline(values: List[float], threshold: float = DEFAULT_Z_THRESHOLD, min_std: float = 0.04) -> Baseline:
    """Calculates personal baseline mean, std and threshold bounds."""
    n = len(values)
    if n == 0:
        return Baseline(0.0, 0.0, 0.0, 0.0)
    mean = sum(values) / n
    variance = sum((x - mean) ** 2 for x in values) / max(1, n - 1)
    std = max(min_std, math.sqrt(variance))
    return Baseline(
        mean=mean,
        std=std,
        lower=mean - threshold * std,
        upper=mean + threshold * std,
    )


def z_score(value: float, baseline: Baseline) -> float:
    """Calculates Z-score with division by zero guard."""
    if baseline.std == 0:
        return 0.0
    safe_std = max(baseline.std, 0.04)
    return (value - baseline.mean) / safe_std


def rolling_baseline(
    series: List[Dict[str, Any]],
    key: str,
    index: int,
    window: int = DEFAULT_BASELINE_WINDOW,
    threshold: float = DEFAULT_Z_THRESHOLD,
) -> Baseline:
    """Computes personal baseline over the previous rolling window."""
    start = max(0, index - window)
    values = [series[i][key] for i in range(start, index) if key in series[i]]
    min_std = PHYSIOLOGICAL_MIN_STD.get(key, 0.04)
    return compute_baseline(values, threshold, min_std=min_std)



def hrv_deviation(series: Any, baseline_days: int = 30, threshold_sd: float = 2.0) -> Dict[str, Any]:
    """
    Evaluates personal baseline deviation without medical interpretation.
    Matches Blueprint Section 4 specification.
    Supports either Pandas Series/NumPy array or standard Python list.
    """
    if hasattr(series, "mean") and hasattr(series, "std"):
        base = series[-baseline_days:]
        mu, sd = float(base.mean()), float(base.std(ddof=1))
        current = float(series[-1])
    else:
        # Standard Python sequence
        base = list(series[-baseline_days:])
        n = len(base)
        if n == 0:
            return {
                "rule": "hrv_below_personal_baseline",
                "current": 0.0,
                "baseline_mean": 0.0,
                "baseline_sd": 0.0,
                "z": 0.0,
                "fired": False,
                "window_days": baseline_days,
            }
        mu = sum(base) / n
        variance = sum((x - mu) ** 2 for x in base) / max(1, n - 1)
        sd = math.sqrt(variance)
        current = float(series[-1])

    safe_sd = max(sd, 0.04)
    z = (current - mu) / safe_sd if sd else 0.0

    return {
        "rule": "hrv_below_personal_baseline",
        "current": float(current),
        "baseline_mean": float(mu),
        "baseline_sd": float(sd),
        "z": float(z),
        "fired": bool(z <= -threshold_sd),
        "window_days": baseline_days,
    }


def detect_alerts_up_to(
    series: List[Dict[str, Any]],
    current_index: int,
    baseline_window: int = 60,
    threshold: float = DEFAULT_Z_THRESHOLD,
) -> List[Dict[str, Any]]:
    """
    Evaluates rolling baselines, z-scores, and multi-signal rules up to current_index.
    Multi-Signal rule fires when >= 2 distinct signals deviate within the window.
    """
    alerts = []
    active_deviations: Dict[str, bool] = {}
    recent_deviations: List[Dict[str, Any]] = []
    counter = 0

    start_idx = max(1, min(baseline_window, current_index))
    for i in range(start_idx, min(current_index + 1, len(series))):
        sample = series[i]
        sample_time = sample.get("timestamp", "")

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
                d for d in recent_deviations if i - d["index"] <= DEFAULT_MULTI_SIGNAL_WINDOW_S
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
