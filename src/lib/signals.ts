export type SignalKey =
  | "heart_rate"
  | "hrv"
  | "spo2"
  | "sleep_hours"
  | "core_temperature"
  | "exercise_minutes";

export interface SignalMeta {
  key: SignalKey;
  label: string;
  short: string;
  unit: string;
  icon: string;
  decimals: number;
  color: string;
}

export const SIGNALS: SignalMeta[] = [
  {
    key: "heart_rate",
    label: "Heart Rate",
    short: "HR",
    unit: "bpm",
    icon: "❤️",
    decimals: 0,
    color: "var(--color-chart-1)",
  },
  {
    key: "hrv",
    label: "HRV",
    short: "HRV",
    unit: "ms",
    icon: "📈",
    decimals: 0,
    color: "var(--color-chart-2)",
  },
  {
    key: "spo2",
    label: "SpO₂",
    short: "SpO2",
    unit: "%",
    icon: "🫁",
    decimals: 0,
    color: "var(--color-chart-3)",
  },
  {
    key: "sleep_hours",
    label: "Sleep",
    short: "Sleep",
    unit: "h",
    icon: "😴",
    decimals: 1,
    color: "var(--color-chart-4)",
  },
  {
    key: "core_temperature",
    label: "Core Temperature",
    short: "Temp",
    unit: "°C",
    icon: "🌡️",
    decimals: 1,
    color: "var(--color-chart-5)",
  },
  {
    key: "exercise_minutes",
    label: "Exercise",
    short: "Exercise",
    unit: "min",
    icon: "🏃",
    decimals: 0,
    color: "var(--color-chart-2)",
  },
];

export const SIGNAL_BY_KEY: Record<SignalKey, SignalMeta> = SIGNALS.reduce(
  (acc, s) => {
    acc[s.key] = s;
    return acc;
  },
  {} as Record<SignalKey, SignalMeta>,
);

export function formatValue(key: SignalKey, value: number) {
  const meta = SIGNAL_BY_KEY[key];
  return `${value.toFixed(meta.decimals)} ${meta.unit}`;
}
