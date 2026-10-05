import type { HealthAlert } from "./compute";
import { SIGNAL_BY_KEY } from "./signals";
import { studiesForSignals, type OsdrStudy } from "./osdr";

const BLOCKED_PATTERNS = [
  /\bdiagnos(is|e|ed|tic)\b/i,
  /\bdisease\b/i,
  /\barrhythmia\b/i,
  /\bmedication\b/i,
  /\btreatment\b/i,
  /\bprescri(be|ption)\b/i,
  /\bstop exercising\b/i,
  /\byou (have|are suffering)\b/i,
  /\bhypoxia\b/i,
];

export const SAFE_FALLBACK =
  "This alert reports a statistical deviation from the crew member's personal baseline. Exact values are shown above. No interpretation beyond the monitored numbers is available.";

export interface ExplanationResult {
  text: string;
  passed: boolean;
  studies: OsdrStudy[];
}

/**
 * Layer 1: template generation constrained to statistical language only.
 * Layer 2: post-generation safety checker that blocks diagnostic or
 * treatment language and falls back to a safe summary.
 */
export function explainAlert(alert: HealthAlert): ExplanationResult {
  const lines = alert.signals.map((s) => {
    const meta = SIGNAL_BY_KEY[s.signal];
    return `${meta.label} is ${s.value.toFixed(meta.decimals)} ${meta.unit} compared with a personal baseline mean of ${s.baseline_mean.toFixed(meta.decimals)} ${meta.unit} (z-score ${s.z_score.toFixed(2)}).`;
  });

  const context =
    alert.rule === "MULTI_SIGNAL_48H"
      ? `Both measurements deviated from their monitored personal baselines within the ${alert.window_hours}-hour window.`
      : "This measurement is outside the monitored personal baseline range.";

  const draft = [
    "What changed?",
    "",
    ...lines,
    "",
    context,
    "",
    "This information describes statistical deviation from simulated personal baseline data and does not establish a medical conclusion.",
  ].join("\n");

  const passed = safetyCheck(draft);
  return {
    text: passed ? draft : SAFE_FALLBACK,
    passed,
    studies: studiesForSignals(alert.signals.map((s) => s.signal)),
  };
}

export function safetyCheck(text: string): boolean {
  return !BLOCKED_PATTERNS.some((p) => p.test(text));
}
