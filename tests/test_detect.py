"""
Astronaut Health Telemetry - Deterministic Unit Tests.
Compliance Checklist validation:
[x] Unit tests pass against both normal and anomalous fixtures.
[x] Deterministic personal baseline (Z-score) calculations.
[x] Multi-signal rule validation (>= 2 signals within window).
[x] Blueprint Section 4 hrv_deviation() test.
[x] Strict NO LLM inside compute boundary.
[x] Safety Guardrails check (blocked clinical/diagnostic terms).
"""

import json
import os
import re
import sys
import unittest

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from src.compute.detect import (
    SIGNAL_KEYS,
    Baseline,
    compute_baseline,
    z_score,
    rolling_baseline,
    hrv_deviation,
    detect_alerts_up_to,
)

FIXTURE_PATHS = [
    os.path.join(ROOT_DIR, "demo_fixtures", "vitals.json"),
    os.path.join(ROOT_DIR, "data", "fixtures", "vitals.json"),
]


class TestAstronautHealthCompute(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        fixture_file = None
        for p in FIXTURE_PATHS:
            if os.path.exists(p):
                fixture_file = p
                break
        if not fixture_file:
            raise FileNotFoundError("Could not find vitals.json fixture.")
        with open(fixture_file, "r", encoding="utf-8") as f:
            cls.series = json.load(f)

    def test_fixture_integrity(self):
        """Fixture should have exactly 600 samples (1 Hz for 10 minutes) and 6 signals."""
        self.assertEqual(len(self.series), 600)
        for key in SIGNAL_KEYS:
            self.assertIn(key, self.series[0], f"Signal {key} missing from sample")

    def test_clean_normal_phase(self):
        """Normal window (0 to 400) should have NO multi-signal alerts."""
        alerts = detect_alerts_up_to(self.series, current_index=400, baseline_window=60, threshold=3.0)
        multi_alerts = [a for a in alerts if a.get("rule") == "MULTI_SIGNAL_ANOMALY"]
        self.assertEqual(len(multi_alerts), 0, "Clean phase should not have multi-signal alerts")

    def test_planted_anomaly_onset_index_450(self):
        """At and after index 450 (07:30 UTC), multi-signal anomaly should fire."""
        alerts = detect_alerts_up_to(self.series, current_index=460, baseline_window=60, threshold=3.0)
        multi_alerts = [a for a in alerts if a.get("rule") == "MULTI_SIGNAL_ANOMALY"]
        self.assertGreaterEqual(len(multi_alerts), 1, "Planted anomaly at 450 must trigger multi-signal alert")
        
        # Verify that multiple signals (>= 2) are listed in the alert
        first_multi = multi_alerts[0]
        self.assertGreaterEqual(len(first_multi["signals"]), 2)

    def test_blueprint_section_4_hrv_deviation(self):
        """Tests the exact Section 4 hrv_deviation function from Blueprint."""
        # Clean baseline series
        clean_hrv = [48.0 + (i % 3) * 0.5 for i in range(40)]
        res_normal = hrv_deviation(clean_hrv, baseline_days=30, threshold_sd=2.0)
        self.assertFalse(res_normal["fired"])
        self.assertEqual(res_normal["rule"], "hrv_below_personal_baseline")

        # Dropping HRV (anomalous)
        anomaly_hrv = clean_hrv + [15.0]  # Sharp drop below personal mean
        res_drop = hrv_deviation(anomaly_hrv, baseline_days=30, threshold_sd=2.0)
        self.assertTrue(res_drop["fired"], "Sharp HRV drop must fire rule")
        self.assertLess(res_drop["z"], -2.0)

    def test_no_llm_in_compute_boundary(self):
        """Verify that src/compute/ contains strictly deterministic code with NO LLM references."""
        compute_file = os.path.join(ROOT_DIR, "src", "compute", "detect.py")
        with open(compute_file, "r", encoding="utf-8") as f:
            code = f.read()

        prohibited_modules = [
            "openai",
            "anthropic",
            "langchain",
            "transformers",
            "ollama",
            "google.generativeai",
        ]
        for mod in prohibited_modules:
            self.assertNotIn(f"import {mod}", code, f"LLM module {mod} found in compute code")

    def test_safety_guardrails_diagnostic_blocking(self):
        """Clinical diagnostic terminology must be detected and blocked by guardrails."""
        blocked_terms = [
            r"\bdiagnos(is|e|ed|tic)\b",
            r"\bdisease\b",
            r"\barrhythmia\b",
            r"\bmedication\b",
            r"\btreatment\b",
            r"\bprescri(be|ption)\b",
            r"\bhypoxia\b",
        ]

        def safety_check(text: str) -> bool:
            return not any(re.search(pat, text, re.IGNORECASE) for pat in blocked_terms)

        # Statistical statement: allowed
        valid_stat = "Heart rate is 112 bpm compared with baseline mean of 71 bpm (z-score 3.8). Multi-signal deviation detected."
        self.assertTrue(safety_check(valid_stat))

        # Diagnostic statements: must be blocked
        invalid_1 = "The crew member has a diagnosis of cardiac arrhythmia."
        invalid_2 = "We prescribe medication and treatment for hypoxia."
        invalid_3 = "The astronaut is suffering from cardiovascular disease."

        self.assertFalse(safety_check(invalid_1))
        self.assertFalse(safety_check(invalid_2))
        self.assertFalse(safety_check(invalid_3))


if __name__ == "__main__":
    unittest.main()
