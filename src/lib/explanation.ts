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
  const studies = studiesForSignals(alert.signals.map((s) => s.signal));
  const studyCitations =
    studies.length > 0
      ? `Referenced research context: ${studies.slice(0, 2).map((s) => `${s.id} ("${s.title}")`).join("; ")}.`
      : "Referenced research context: NASA Open Science Data Repository (OSDR).";

  const lines = alert.signals.map((s) => {
    const meta = SIGNAL_BY_KEY[s.signal];
    const direction = s.value < s.baseline_mean ? "below" : "above";
    return `• ${meta.label} is currently ${s.value.toFixed(meta.decimals)} ${meta.unit}, compared with Alex's personal baseline of ${s.baseline_mean.toFixed(meta.decimals)} ${meta.unit} (SD: ${s.baseline_std.toFixed(2)}). The detection rule fired because the measurement was ${Math.abs(s.z_score).toFixed(2)} standard deviations ${direction} baseline (z-score ${s.z_score.toFixed(2)}σ).`;
  });

  const ruleContext =
    alert.rule === "MULTI_SIGNAL_48H" || alert.rule === "MULTI_SIGNAL_ANOMALY"
      ? `Two or more monitored signals simultaneously deviated from Alex's personal baseline within the configured mission monitoring window.`
      : "This measurement deviated from Alex's personal baseline threshold.";

  const draft = [
    "🤖 Explanation Agent Summary:",
    "",
    "What changed:",
    ...lines,
    "",
    ruleContext,
    "",
    studyCitations,
    "",
    "Compliance notice: This summary describes statistical deviation evidenced by NASA OSDR literature. It does not constitute medical diagnosis or treatment advice.",
  ].join("\n");

  const passed = safetyCheck(draft);
  return {
    text: passed ? draft : SAFE_FALLBACK,
    passed,
    studies,
  };
}

export function safetyCheck(text: string): boolean {
  return !BLOCKED_PATTERNS.some((p) => p.test(text));
}
