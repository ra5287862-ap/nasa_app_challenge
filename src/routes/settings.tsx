import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ReplayControls } from "@/components/ReplayControls";
import { useMission } from "@/lib/mission-store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Crew Health Console" },
      {
        name: "description",
        content:
          "Configure replay speed, baseline window, z-score threshold, multi-signal window and chart time range.",
      },
      { property: "og:title", content: "Settings — Crew Health Console" },
      {
        property: "og:description",
        content: "Detection and display configuration for the monitoring console.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { config, setConfig, chartPoints, setChartPoints } = useMission();

  return (
    <AppShell title="Settings">
      <section className="bg-[#08131B]/25 border border-cyan-500/20 rounded-xl max-w-2xl space-y-6 p-5 shadow-[0_4px_24px_-4px_rgba(5,10,15,0.7)] backdrop-blur-md">
        <div>
          <h2 className="font-mono text-xs uppercase tracking-wider text-[#7F98A3]">
            Replay Controls
          </h2>
          <div className="mt-3">
            <ReplayControls />
          </div>
        </div>

        <div className="space-y-4 border-t border-cyan-500/20 pt-5 font-mono">
          <h2 className="text-xs uppercase tracking-wider text-cyan-400 font-semibold">
            Detection Configuration
          </h2>

          <label className="block text-sm text-[#E5EEF2]">
            Z-score threshold: <span className="tabular-nums font-bold text-cyan-300">{config.threshold.toFixed(1)}σ</span>
            <input
              type="range"
              min={2}
              max={5}
              step={0.1}
              value={config.threshold}
              onChange={(e) =>
                setConfig({ ...config, threshold: Number(e.target.value) })
              }
              className="mt-2 w-full accent-cyan-400 bg-[#0B1821]"
            />
          </label>

          <label className="block text-sm text-[#E5EEF2]">
            Baseline window:{" "}
            <span className="tabular-nums font-bold text-cyan-300">{config.baselineWindow / 2} hours</span>
            <input
              type="range"
              min={48}
              max={192}
              step={8}
              value={config.baselineWindow}
              onChange={(e) =>
                setConfig({ ...config, baselineWindow: Number(e.target.value) })
              }
              className="mt-2 w-full accent-cyan-400 bg-[#0B1821]"
            />
          </label>

          <label className="block text-sm">
            Multi-signal window:{" "}
            <span className="tabular-nums">{config.multiSignalWindowH} hours</span>
            <input
              type="range"
              min={12}
              max={96}
              step={6}
              value={config.multiSignalWindowH}
              onChange={(e) =>
                setConfig({ ...config, multiSignalWindowH: Number(e.target.value) })
              }
              className="mt-2 w-full accent-[var(--color-primary)]"
            />
          </label>
        </div>

        <div className="space-y-4 border-t border-border/60 pt-5">
          <h2 className="font-display text-sm uppercase tracking-wider text-muted-foreground">
            Display
          </h2>
          <label className="block text-sm">
            Chart time range: <span className="tabular-nums">{chartPoints} samples</span>
            <input
              type="range"
              min={60}
              max={500}
              step={20}
              value={chartPoints}
              onChange={(e) => setChartPoints(Number(e.target.value))}
              className="mt-2 w-full accent-[var(--color-primary)]"
            />
          </label>
        </div>

        <p className="border-t border-border/60 pt-4 text-xs text-muted-foreground">
          All values are computed from simulated telemetry. Changing detection settings
          recomputes alerts from the replayed data.
        </p>
      </section>
    </AppShell>
  );
}
