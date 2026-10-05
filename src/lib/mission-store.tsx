import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_CONFIG,
  detectAlerts,
  generateMissionSeries,
  rollingBaseline,
  zScore,
  type Baseline,
  type DetectionConfig,
  type HealthAlert,
  type VitalSample,
} from "./compute";
import { SIGNALS, type SignalKey } from "./signals";
import { FIXTURE_SAMPLES, ANOMALY_INDEX as FIXTURE_ANOMALY_INDEX } from "./vitals-fixture";

export const CREW_ID = "CREW-01";
export const MISSION_NAME = "AURORA-01";
const TOTAL_POINTS_SIMULATED = 720;
const WARMUP_SIMULATED = 200;
const WARMUP_FIXTURE = 60; // 1 minute baseline window for 600s fixture

export type DatasetMode = "fixture-600" | "simulated-720";
export type ConnectionState = "connected" | "reconnecting";

interface MissionContextValue {
  mode: DatasetMode;
  setMode: (m: DatasetMode) => void;
  isFixtureMode: boolean;
  series: VitalSample[];
  cursor: number;
  current: VitalSample | null;
  history: VitalSample[];
  baselines: Record<SignalKey, Baseline>;
  zScores: Record<SignalKey, number>;
  deviatingNow: SignalKey[];
  alerts: HealthAlert[];
  config: DetectionConfig;
  setConfig: (c: DetectionConfig) => void;
  speed: number;
  setSpeed: (s: number) => void;
  running: boolean;
  setRunning: (r: boolean) => void;
  restart: () => void;
  seek: (index: number) => void;
  jumpToAnomaly: () => void;
  anomalyIndex: number;
  connection: ConnectionState;
  chartPoints: number;
  setChartPoints: (n: number) => void;
}

const MissionContext = createContext<MissionContextValue | null>(null);

export function MissionProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<DatasetMode>("fixture-600");
  const isFixtureMode = mode === "fixture-600";

  const simulatedSeries = useMemo(
    () => generateMissionSeries(CREW_ID, TOTAL_POINTS_SIMULATED),
    [],
  );

  const series = isFixtureMode ? FIXTURE_SAMPLES : simulatedSeries;
  const warmup = isFixtureMode ? WARMUP_FIXTURE : WARMUP_SIMULATED;
  const anomalyIndex = isFixtureMode ? FIXTURE_ANOMALY_INDEX : 300;

  const [cursor, setCursor] = useState(warmup);
  const [speed, setSpeed] = useState(1);
  const [running, setRunning] = useState(true);
  const [config, setConfig] = useState<DetectionConfig>(() => ({
    ...DEFAULT_CONFIG,
    baselineWindow: isFixtureMode ? 60 : DEFAULT_CONFIG.baselineWindow,
  }));
  const [chartPoints, setChartPoints] = useState(isFixtureMode ? 120 : 240);
  const [connection, setConnection] = useState<ConnectionState>("connected");

  const cursorRef = useRef(cursor);
  cursorRef.current = cursor;

  // Reset or adjust when dataset mode changes
  useEffect(() => {
    setCursor(isFixtureMode ? WARMUP_FIXTURE : WARMUP_SIMULATED);
    setConfig((prev) => ({
      ...prev,
      baselineWindow: isFixtureMode ? 60 : 96,
    }));
    setChartPoints(isFixtureMode ? 120 : 240);
  }, [isFixtureMode]);

  useEffect(() => {
    if (!running) return;
    const interval = isFixtureMode
      ? Math.max(50, 1000 / speed)
      : Math.max(120, 1200 / speed);

    const id = window.setInterval(() => {
      setCursor((c) => (c + 1 >= series.length ? warmup : c + 1));
    }, interval);
    return () => window.clearInterval(id);
  }, [running, speed, series.length, isFixtureMode, warmup]);

  useEffect(() => {
    setConnection(running ? "connected" : "reconnecting");
  }, [running]);

  const value = useMemo<MissionContextValue>(() => {
    const current = series[cursor] ?? null;
    const history = series.slice(Math.max(0, cursor - chartPoints), cursor + 1);
    const baselines = {} as Record<SignalKey, Baseline>;
    const zScores = {} as Record<SignalKey, number>;
    const deviatingNow: SignalKey[] = [];

    for (const meta of SIGNALS) {
      const b = rollingBaseline(
        series,
        meta.key,
        cursor,
        config.baselineWindow,
        config.threshold,
      );
      baselines[meta.key] = b;
      const z = current ? zScore(current[meta.key] as number, b) : 0;
      zScores[meta.key] = z;
      if (Math.abs(z) >= config.threshold) deviatingNow.push(meta.key);
    }

    const alerts = detectAlerts(series, cursor, config);

    return {
      mode,
      setMode,
      isFixtureMode,
      series,
      cursor,
      current,
      history,
      baselines,
      zScores,
      deviatingNow,
      alerts,
      config,
      setConfig,
      speed,
      setSpeed,
      running,
      setRunning,
      restart: () => setCursor(warmup),
      seek: (idx: number) => {
        const clamped = Math.max(0, Math.min(series.length - 1, idx));
        setCursor(clamped);
      },
      jumpToAnomaly: () => {
        setCursor(anomalyIndex);
      },
      anomalyIndex,
      connection,
      chartPoints,
      setChartPoints,
    };
  }, [
    mode,
    isFixtureMode,
    series,
    cursor,
    config,
    speed,
    running,
    connection,
    chartPoints,
    warmup,
    anomalyIndex,
  ]);

  return <MissionContext.Provider value={value}>{children}</MissionContext.Provider>;
}

export function useMission() {
  const ctx = useContext(MissionContext);
  if (!ctx) throw new Error("useMission must be used inside MissionProvider");
  return ctx;
}
