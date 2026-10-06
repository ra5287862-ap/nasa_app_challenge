import { SIGNALS, type SignalKey } from "./signals";

export interface VitalSample {
  index: number;
  timestamp: number; // epoch ms
  crew_id: string;
  heart_rate: number;
  hrv: number;
  spo2: number;
  sleep_hours: number;
  core_temperature: number;
  exercise_minutes: number;
  simulated: true;
}

export interface Baseline {
  mean: number;
  std: number;
  lower: number;
  upper: number;
}

export interface SignalDeviation {
  signal: SignalKey;
  value: number;
  baseline_mean: number;
  baseline_std: number;
  z_score: number;
}

export type AlertRule = "Z_SCORE_DEVIATION" | "MULTI_SIGNAL_48H";

export interface HealthAlert {
  alert_id: string;
  timestamp: number;
  crew_id: string;
  rule: AlertRule;
  status: "DEVIATION" | "MULTI-SIGNAL";
  signals: SignalDeviation[];
  threshold: number;
  window_hours?: number;
  simulated: true;
}

export const STEP_MS = 30 * 60 * 1000; // one sample every 30 simulated minutes
export const MISSION_START = Date.UTC(2026, 0, 1, 0, 0, 0);
export const BASELINE_WINDOW = 96; // 48 h of history
export const Z_THRESHOLD = 3;
export const MULTI_SIGNAL_WINDOW_H = 48;

/* ------------------------------------------------------------------ */
/* Deterministic simulated telemetry (no Math.random at module scope)  */
/* ------------------------------------------------------------------ */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Anomaly {
  signal: SignalKey;
  start: number;
  length: number;
  delta: number;
}

/** Planted anomalies drive the controlled demo story. */
const PLANTED: Anomaly[] = [
  { signal: "heart_rate", start: 300, length: 14, delta: 38 },
  { signal: "spo2", start: 340, length: 12, delta: -7 },
  { signal: "sleep_hours", start: 520, length: 8, delta: -3.4 },
  { signal: "hrv", start: 620, length: 10, delta: -26 },
  { signal: "core_temperature", start: 640, length: 10, delta: 1.1 },
];

const BASE = {
  heart_rate: 74.5,
  hrv: 54,
  spo2: 97.8,
  sleep_hours: 7.4,
  core_temperature: 36.8,
  exercise_minutes: 42,
};

const NOISE = {
  heart_rate: 4.2,
  hrv: 4.5,
  spo2: 0.6,
  sleep_hours: 0.5,
  core_temperature: 0.12,
  exercise_minutes: 6,
};

export function generateMissionSeries(
  crewId = "CREW-01",
  points = 720,
): VitalSample[] {
  const rand = mulberry32(20260101);
  const out: VitalSample[] = [];
  for (let i = 0; i < points; i++) {
    const hourOfDay = ((i * 0.5) % 24) + 0;
    const circadian = Math.sin((hourOfDay / 24) * Math.PI * 2);
    const sample: VitalSample = {
      index: i,
      timestamp: MISSION_START + i * STEP_MS,
      crew_id: crewId,
      simulated: true,
      heart_rate: BASE.heart_rate + circadian * 4 + gauss(rand) * NOISE.heart_rate,
      hrv: BASE.hrv - circadian * 3 + gauss(rand) * NOISE.hrv,
      spo2: BASE.spo2 + gauss(rand) * NOISE.spo2,
      sleep_hours: BASE.sleep_hours + gauss(rand) * NOISE.sleep_hours,
      core_temperature:
        BASE.core_temperature + circadian * 0.12 + gauss(rand) * NOISE.core_temperature,
      exercise_minutes: Math.max(
        0,
        BASE.exercise_minutes + gauss(rand) * NOISE.exercise_minutes,
      ),
    };
    for (const a of PLANTED) {
      if (i >= a.start && i < a.start + a.length) {
        const ramp = Math.sin(((i - a.start) / a.length) * Math.PI);
        (sample[a.signal] as number) += a.delta * (0.55 + 0.45 * ramp);
      }
    }
    sample.spo2 = Math.min(100, sample.spo2);
    out.push(sample);
  }
  return out;
}

function gauss(rand: () => number) {
  return (
    Math.sqrt(-2 * Math.log(rand() + 1e-9)) * Math.cos(2 * Math.PI * rand())
  );
}

/* ------------------------------------------------------------------ */
/* Baseline + z-score                                                  */
/* ------------------------------------------------------------------ */

export const PHYSIOLOGICAL_MIN_STD: Record<SignalKey, number> = {
  heart_rate: 2.0,
  hrv: 2.0,
  spo2: 0.8,
  core_temperature: 0.1,
  sleep_hours: 0.2,
  exercise_minutes: 1.0,
};

export function computeBaseline(values: number[], threshold = Z_THRESHOLD, minStd = 0.04): Baseline {
  const n = values.length;
  if (n === 0) return { mean: 0, std: 0, lower: 0, upper: 0 };
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const variance =
    values.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, n - 1);
  const std = Math.max(minStd, Math.sqrt(variance));
  return {
    mean,
    std,
    lower: mean - threshold * std,
    upper: mean + threshold * std,
  };
}

export function zScore(value: number, b: Baseline) {
  if (!b.std) return 0;
  const safeStd = Math.max(b.std, 0.04);
  return (value - b.mean) / safeStd;
}

export function rollingBaseline(
  series: VitalSample[],
  key: SignalKey,
  index: number,
  window = BASELINE_WINDOW,
  threshold = Z_THRESHOLD,
): Baseline {
  const start = Math.max(0, index - window);
  const values: number[] = [];
  for (let i = start; i < index; i++) {
    const s = series[i];
    if (s) values.push(s[key] as number);
  }
  const minStd = PHYSIOLOGICAL_MIN_STD[key] ?? 0.04;
  return computeBaseline(values, threshold, minStd);
}

/* ------------------------------------------------------------------ */
/* Detection engine                                                    */
/* ------------------------------------------------------------------ */

export interface DetectionConfig {
  threshold: number;
  baselineWindow: number;
  multiSignalWindowH: number;
}

export const DEFAULT_CONFIG: DetectionConfig = {
  threshold: Z_THRESHOLD,
  baselineWindow: BASELINE_WINDOW,
  multiSignalWindowH: MULTI_SIGNAL_WINDOW_H,
};

export function detectAlerts(
  series: VitalSample[],
  upTo: number,
  config: DetectionConfig = DEFAULT_CONFIG,
): HealthAlert[] {
  const alerts: HealthAlert[] = [];
  const active: Partial<Record<SignalKey, boolean>> = {};
  const deviations: { signal: SignalKey; at: number; dev: SignalDeviation }[] = [];
  let counter = 0;

  for (let i = config.baselineWindow; i <= upTo && i < series.length; i++) {
    const sample = series[i];
    if (!sample) continue;
    for (const meta of SIGNALS) {
      const b = rollingBaseline(
        series,
        meta.key,
        i,
        config.baselineWindow,
        config.threshold,
      );
      const value = series[i][meta.key] as number;
      const z = zScore(value, b);
      const isDev = Math.abs(z) >= config.threshold;
      if (isDev && !active[meta.key]) {
        active[meta.key] = true;
        const dev: SignalDeviation = {
          signal: meta.key,
          value,
          baseline_mean: b.mean,
          baseline_std: b.std,
          z_score: z,
        };
        counter += 1;
        alerts.push({
          alert_id: `ALT-${String(counter).padStart(3, "0")}`,
          timestamp: series[i].timestamp,
          crew_id: series[i].crew_id,
          rule: "Z_SCORE_DEVIATION",
          status: "DEVIATION",
          signals: [dev],
          threshold: config.threshold,
          simulated: true,
        });
        deviations.push({ signal: meta.key, at: series[i].timestamp, dev });

        // multi-signal rule: another distinct signal deviated within the window
        const sampleStepMs = series.length > 1 ? series[1]!.timestamp - series[0]!.timestamp : 1000;
        const isFixtureReplay = sampleStepMs <= 5000;
        const windowMs = isFixtureReplay ? 120 * 1000 : config.multiSignalWindowH * 3600 * 1000;
        const suppressionMs = isFixtureReplay ? 20 * 1000 : windowMs / 2;

        const recent = deviations.filter(
          (d) => series[i].timestamp - d.at <= windowMs,
        );
        const distinct = new Map<SignalKey, SignalDeviation>();
        for (const r of recent) distinct.set(r.signal, r.dev);
        if (distinct.size >= 2) {
          const last = alerts[alerts.length - 1];
          const alreadyMulti = alerts.some(
            (a) =>
              a.rule === "MULTI_SIGNAL_48H" &&
              series[i].timestamp - a.timestamp < suppressionMs,
          );
          if (!alreadyMulti && last) {
            counter += 1;
            alerts.push({
              alert_id: `ALT-${String(counter).padStart(3, "0")}`,
              timestamp: series[i].timestamp,
              crew_id: series[i].crew_id,
              rule: "MULTI_SIGNAL_48H",
              status: "MULTI-SIGNAL",
              signals: Array.from(distinct.values()),
              threshold: config.threshold,
              window_hours: isFixtureReplay ? 0.03 : config.multiSignalWindowH,
              simulated: true,
            });
          }
        }
      } else if (!isDev) {
        active[meta.key] = false;
      }
    }
  }
  return alerts.reverse();
}

/* ------------------------------------------------------------------ */
/* Crew summary                                                        */
/* ------------------------------------------------------------------ */

export function crewSummary(
  deviatingNow: SignalKey[],
  recentMulti: boolean,
): string {
  if (recentMulti)
    return "Two or more monitored signals have deviated from their personal baselines within the last 48 hours.";
  if (deviatingNow.length === 1)
    return "One monitored signal is currently outside the personal baseline range.";
  if (deviatingNow.length > 1)
    return "Several monitored signals are currently outside the personal baseline range.";
  return "All monitored signals are currently within the personal baseline range.";
}

export function missionDay(timestamp: number) {
  return Math.floor((timestamp - MISSION_START) / (24 * 3600 * 1000)) + 1;
}

export function formatUtc(timestamp: number) {
  const d = new Date(timestamp);
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(
    d.getUTCMinutes(),
  ).padStart(2, "0")} UTC`;
}

export function formatDateUtc(timestamp: number) {
  return new Date(timestamp).toISOString().replace("T", " ").slice(0, 16) + " UTC";
}

export function formatSecondsAsBeat(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
