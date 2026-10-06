"""
Astronaut Health Telemetry Compute Engine (Python).
Imports and aliases src/compute/detect.py for full backward-compatibility and blueprint alignment.
"""

import sys
import os

# Add root directory to python path if needed
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from src.compute.detect import (
    SIGNAL_KEYS,
    DEFAULT_BASELINE_WINDOW,
    DEFAULT_Z_THRESHOLD,
    DEFAULT_MULTI_SIGNAL_WINDOW_S,
    Baseline,
    compute_baseline,
    z_score,
    rolling_baseline,
    hrv_deviation,
    detect_alerts_up_to,
)

__all__ = [
    "SIGNAL_KEYS",
    "DEFAULT_BASELINE_WINDOW",
    "DEFAULT_Z_THRESHOLD",
    "DEFAULT_MULTI_SIGNAL_WINDOW_S",
    "Baseline",
    "compute_baseline",
    "z_score",
    "rolling_baseline",
    "hrv_deviation",
    "detect_alerts_up_to",
]
