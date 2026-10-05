import { AlertTriangle, FastForward, Pause, Play, RotateCcw } from "lucide-react";
import { useMission } from "@/lib/mission-store";
import { formatSecondsAsBeat } from "@/lib/compute";

const SPEEDS = [0.5, 1, 2, 5, 10];

export function ReplayControls() {
  const {
    speed,
    setSpeed,
    running,
    setRunning,
    restart,
    seek,
    jumpToAnomaly,
    cursor,
    series,
    mode,
    setMode,
    isFixtureMode,
    anomalyIndex,
  } = useMission();

  const maxIndex = Math.max(1, series.length - 1);
  const percent = Math.min(100, Math.max(0, (cursor / maxIndex) * 100));
  const isAtAnomaly = cursor >= anomalyIndex && cursor <= anomalyIndex + 80;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card/60 p-3 backdrop-blur-md">
      {/* Top row: Mode selector, speed & playback controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-muted-foreground">Mode:</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as any)}
            className="rounded-lg border border-input bg-panel px-2.5 py-1 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="fixture-600">Deterministic 600s Fixture (Anomaly @ 07:30)</option>
            <option value="simulated-720">Extended Synthetic Mission (720 pts)</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isFixtureMode && (
            <button
              onClick={jumpToAnomaly}
              title="Jump to 07:30 (Index 450) where the multi-signal anomaly triggers"
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                isAtAnomaly
                  ? "border-destructive/80 bg-destructive/20 text-destructive shadow-sm animate-pulse"
                  : "border-warning/60 bg-warning/15 text-warning hover:bg-warning/25"
              }`}
            >
              <AlertTriangle className="size-3.5" aria-hidden />
              <span>Jump to 07:30 (Anomaly)</span>
            </button>
          )}

          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Speed</span>
            <select
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="rounded-lg border border-input bg-panel px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {SPEEDS.map((s) => (
                <option key={s} value={s}>
                  {s}x
                </option>
              ))}
            </select>
          </label>

          <button
            onClick={() => setRunning(!running)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-panel px-3 py-1 text-xs font-medium transition-colors hover:bg-accent/40"
          >
            {running ? (
              <>
                <Pause className="size-3.5" aria-hidden /> Pause
              </>
            ) : (
              <>
                <Play className="size-3.5" aria-hidden /> Run
              </>
            )}
          </button>

          <button
            onClick={restart}
            title="Restart replay from warmup"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-panel px-2.5 py-1 text-xs font-medium transition-colors hover:bg-accent/40"
          >
            <RotateCcw className="size-3.5" aria-hidden />
          </button>
        </div>
      </div>

      {/* Scrubber timeline bar with anomaly beat marker */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            {isFixtureMode ? (
              <>
                Demo Beat: <strong className="text-foreground">{formatSecondsAsBeat(cursor)}</strong> / 10:00{" "}
                <span className="opacity-70">(Index {cursor} / 600)</span>
              </>
            ) : (
              <>
                Sample: <strong className="text-foreground">{cursor}</strong> / {series.length}
              </>
            )}
          </span>
          {isFixtureMode && (
            <span className="flex items-center gap-1 font-mono text-[10px] text-warning">
              <span className="inline-block size-1.5 rounded-full bg-warning animate-ping" />
              Anomaly planted at 07:30 (idx 450)
            </span>
          )}
        </div>

        <div className="relative flex items-center">
          <input
            type="range"
            min={0}
            max={maxIndex}
            value={cursor}
            onChange={(e) => seek(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-secondary/80 accent-primary focus:outline-none"
          />

          {/* Anomaly marker on scrubber track */}
          {isFixtureMode && (
            <div
              style={{ left: `${(anomalyIndex / maxIndex) * 100}%` }}
              className="pointer-events-none absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
              title="Planted Anomaly Location: 07:30 (Sample 450)"
            >
              <div className="size-3 rounded-full border-2 border-background bg-destructive shadow-sm" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
