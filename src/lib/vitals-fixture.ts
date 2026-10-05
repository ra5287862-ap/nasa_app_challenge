import rawFixture from "../../data/fixtures/vitals.json";
import type { VitalSample } from "./compute";

export interface RawVitalRow {
  index: number;
  timestamp: string;
  heart_rate: number;
  hrv: number;
  spo2: number;
  sleep_hours: number;
  core_temperature: number;
  exercise_minutes: number;
}

export const ANOMALY_INDEX = 450;
export const TOTAL_FIXTURE_ROWS = 600;

/**
 * Deterministic 600-sample raw vitals fixture converted to VitalSample format.
 * - Exactly 600 samples (10 minutes, 1 sample/sec)
 * - Planted anomaly trigger at ANOMALY_INDEX = 450 (07:30 UTC)
 * - Does NOT contain precomputed alerts; alerts are computed by the application detector.
 */
export const FIXTURE_SAMPLES: VitalSample[] = (rawFixture as RawVitalRow[]).map(
  (row) => ({
    index: row.index,
    timestamp: new Date(row.timestamp).getTime(),
    crew_id: "CREW-01",
    heart_rate: row.heart_rate,
    hrv: row.hrv,
    spo2: row.spo2,
    sleep_hours: row.sleep_hours,
    core_temperature: row.core_temperature,
    exercise_minutes: row.exercise_minutes,
    simulated: true as const,
  }),
);
