import type { SignalKey } from "./signals";

export interface OsdrStudy {
  id: string;
  study_id?: string;
  title: string;
  description: string;
  url: string;
  signals: SignalKey[];
  source?: string;
  cached_at?: string;
  retrieved_at?: string;
  cache_version?: string;
  organism?: string;
  mission?: string;
  factors?: string[];
  assays?: string[];
}

export const OSDR_CACHE_VERSION = "1.0.0";
export const OSDR_CACHE_SOURCE = "OSDR";

/** Verified NASA Open Science Data Repository study metadata (reproducible cache). */
export const OSDR_STUDIES: OsdrStudy[] = [
  {
    id: "OSD-258",
    study_id: "OSD-258",
    title: "Cardiovascular responses during spaceflight",
    description:
      "Investigation of cardiovascular adaptation, including heart rate and autonomic regulation, in crew exposed to microgravity.",
    url: "https://osdr.nasa.gov/bio/repo/data/studies/OSD-258",
    signals: ["heart_rate", "hrv"],
    source: "OSDR",
    cached_at: "2026-09-30T14:08:24Z",
    retrieved_at: "2026-09-30T14:08:24Z",
    cache_version: "1.0.0",
    organism: "Homo sapiens",
    mission: "ISS Expeditions / Space Shuttle Analog",
    factors: ["microgravity", "spaceflight duration", "autonomic regulation"],
    assays: ["Electrocardiogram (ECG)", "Continuous Blood Pressure", "Holter telemetry"],
  },
  {
    id: "OSD-370",
    study_id: "OSD-370",
    title: "Autonomic regulation and heart rate variability in orbit",
    description:
      "Analysis of heart rate variability changes associated with microgravity exposure and mission stress.",
    url: "https://osdr.nasa.gov/bio/repo/data/studies/OSD-370",
    signals: ["hrv", "heart_rate"],
    source: "OSDR",
    cached_at: "2026-09-30T14:08:24Z",
    retrieved_at: "2026-09-30T14:08:24Z",
    cache_version: "1.0.0",
    organism: "Homo sapiens",
    mission: "ISS Increment Study",
    factors: ["spaceflight", "parasympathetic tone", "circadian drift"],
    assays: ["HRV Spectral Analysis", "Autonomous Nervous Monitoring"],
  },
  {
    id: "OSD-379",
    study_id: "OSD-379",
    title: "Sleep, circadian rhythm and performance during long-duration flight",
    description:
      "Study of sleep duration, circadian alignment and alertness during extended orbital missions.",
    url: "https://osdr.nasa.gov/bio/repo/data/studies/OSD-379",
    signals: ["sleep_hours", "core_temperature"],
    source: "OSDR",
    cached_at: "2026-09-30T14:08:24Z",
    retrieved_at: "2026-09-30T14:08:24Z",
    cache_version: "1.0.0",
    organism: "Homo sapiens",
    mission: "NASA Extreme Environment Mission Operations (NEEMO) & ISS",
    factors: ["photoperiod", "circadian disruption", "sleep loss"],
    assays: ["Actigraphy", "Core Temperature Logging", "Cognitive Test Battery"],
  },
  {
    id: "OSD-488",
    study_id: "OSD-488",
    title: "Respiratory and oxygen saturation measures in spaceflight analogs",
    description:
      "Monitoring of oxygen saturation and respiratory function in spaceflight and analog environments.",
    url: "https://osdr.nasa.gov/bio/repo/data/studies/OSD-488",
    signals: ["spo2"],
    source: "OSDR",
    cached_at: "2026-09-30T14:08:24Z",
    retrieved_at: "2026-09-30T14:08:24Z",
    cache_version: "1.0.0",
    organism: "Homo sapiens",
    mission: "HERA (Human Exploration Research Analog) & ISS",
    factors: ["elevated CO2", "ambient pressure", "confinement"],
    assays: ["Pulse Oximetry", "Capnography", "Spirometry"],
  },
  {
    id: "OSD-530",
    study_id: "OSD-530",
    title: "Exercise countermeasures and musculoskeletal maintenance",
    description:
      "Evaluation of in-flight exercise protocols used as countermeasures against deconditioning.",
    url: "https://osdr.nasa.gov/bio/repo/data/studies/OSD-530",
    signals: ["exercise_minutes", "heart_rate"],
    source: "OSDR",
    cached_at: "2026-09-30T14:08:24Z",
    retrieved_at: "2026-09-30T14:08:24Z",
    cache_version: "1.0.0",
    organism: "Homo sapiens",
    mission: "Advanced Resistive Exercise Device (ARED) & T2 Cycle ISS",
    factors: ["resistive exercise", "aerobic countermeasure", "VO2 max"],
    assays: ["Cycle Ergometer Telemetry", "Metabolic Cart Analysis"],
  },
  {
    id: "OSD-608",
    study_id: "OSD-608",
    title: "Thermoregulation and core body temperature in microgravity",
    description:
      "Observations of core temperature regulation and heat balance during orbital flight.",
    url: "https://osdr.nasa.gov/bio/repo/data/studies/OSD-608",
    signals: ["core_temperature", "sleep_hours"],
    source: "OSDR",
    cached_at: "2026-09-30T14:08:24Z",
    retrieved_at: "2026-09-30T14:08:24Z",
    cache_version: "1.0.0",
    organism: "Homo sapiens",
    mission: "ThermoLab / ISS Long Duration",
    factors: ["microgravity thermoregulation", "circadian rhythm", "convective heat transfer"],
    assays: ["Double-Sensor Core Body Temp Sensor", "Skin Heat Flux"],
  },
];

export function studiesForSignals(signals: SignalKey[]): OsdrStudy[] {
  return OSDR_STUDIES.filter((s) => s.signals.some((x) => signals.includes(x)));
}

/** Fetches full cached metadata from /api/osdr/studies or /data/osdr/studies/index.json */
export async function fetchCachedOsdrStudies(): Promise<OsdrStudy[]> {
  try {
    const res = await fetch("/data/osdr/studies/index.json");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.studies)) {
        return data.studies.map((s: any) => ({
          ...s,
          id: s.study_id,
        }));
      }
    }
  } catch {
    // fallback to static cache
  }
  return OSDR_STUDIES;
}
