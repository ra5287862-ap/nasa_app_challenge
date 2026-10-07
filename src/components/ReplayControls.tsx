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
    <div className="flex flex-col gap-3 rounded-xl border border-cyan-500/20 bg-[#08131B]/25 p-3.5 text-[#E5EEF2] backdrop-blur-md shadow-[0_4px_20px_-4px_rgba(5,10,15,0.4)]">
      {/* Top row: Mode selector, speed & playback controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-mono text-[#7F98A3]">MODE:</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as any)}
            className="rounded-lg border border-cyan-500/25 bg-[#040A10]/50 backdrop-blur-sm px-2.5 py-1 text-xs font-mono text-[#E5EEF2] focus:outline-none focus:border-cyan-400"
          >
            <option value="fixture-600">Deterministic 600s Fixture (Anomaly @ 07:30)</option>
            <option value="simulated-720">Extended Synthetic Mission (720 pts)</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isFixtureMode && (
            <button
              onClick={jumpToAnomaly}
              title="Jump to 07:30 (Index 450) where Alex's planted multi-signal anomaly begins"
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-mono font-semibold transition-all ${
                isAtAnomaly
                  ? "border-red-500/80 bg-red-500/20 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse"
                  : "border-amber-500/50 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25"
              }`}
            >
              <AlertTriangle className="size-3.5" aria-hidden />
              <span>⚡ Jump to Anomaly (Alex @ 07:30)</span>
            </button>
          )}

          <label className="flex items-center gap-1.5 text-xs font-mono text-[#7F98A3]">
            <span>SPEED</span>
            <select
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="rounded-lg border border-cyan-500/25 bg-[#040A10]/50 backdrop-blur-sm px-2 py-1 text-xs font-mono text-[#E5EEF2] focus:outline-none focus:border-cyan-400"
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
            className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-[#0B1821]/40 backdrop-blur-sm px-3 py-1 text-xs font-mono font-medium text-[#E5EEF2] transition-colors hover:bg-cyan-500/20 hover:border-cyan-400/50"
          >
            {running ? (
              <>
                <Pause className="size-3.5 text-cyan-300" aria-hidden /> Pause
              </>
            ) : (
              <>
                <Play className="size-3.5 text-cyan-300" aria-hidden /> Run
              </>
            )}
          </button>

          <button
            onClick={restart}
            title="Restart replay from warmup"
            className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-[#0B1821]/40 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-[#E5EEF2] transition-colors hover:bg-cyan-500/20 hover:border-cyan-400/50"
          >
            <RotateCcw className="size-3.5 text-cyan-300" aria-hidden />
          </button>
        </div>
      </div>

      {/* Scrubber timeline bar with anomaly beat marker */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono text-[#7F98A3]">
          <span>
            {isFixtureMode ? (
              <>
                Demo Beat: <strong className="text-cyan-300">{formatSecondsAsBeat(cursor)}</strong> / 10:00{" "}
                <span className="opacity-70">(Index {cursor} / 600)</span>
              </>
            ) : (
              <>
                Sample: <strong className="text-cyan-300">{cursor}</strong> / {series.length}
              </>
            )}
          </span>
          {isFixtureMode && (
            <span className="flex items-center gap-1 font-mono text-[10px] text-amber-400">
              <span className="inline-block size-1.5 rounded-full bg-amber-400 animate-ping" />
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
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-[#0B1821] accent-cyan-400 focus:outline-none"
          />

          {/* Anomaly marker on scrubber track */}
          {isFixtureMode && (
            <div
              style={{ left: `${(anomalyIndex / maxIndex) * 100}%` }}
              className="pointer-events-none absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
              title="Planted Anomaly Location: 07:30 (Sample 450)"
            >
              <div className="size-3.5 rounded-full border-2 border-[#050A0F] bg-[#EF4444] shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
