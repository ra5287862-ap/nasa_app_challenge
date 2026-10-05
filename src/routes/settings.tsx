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
      <section className="glass-panel max-w-2xl space-y-6 p-5">
        <div>
          <h2 className="font-display text-sm uppercase tracking-wider text-muted-foreground">
            Replay
          </h2>
          <div className="mt-3">
            <ReplayControls />
          </div>
        </div>

        <div className="space-y-4 border-t border-border/60 pt-5">
          <h2 className="font-display text-sm uppercase tracking-wider text-muted-foreground">
            Detection
          </h2>

          <label className="block text-sm">
            Z-score threshold: <span className="tabular-nums">{config.threshold.toFixed(1)}</span>
            <input
              type="range"
              min={2}
              max={5}
              step={0.1}
              value={config.threshold}
              onChange={(e) =>
                setConfig({ ...config, threshold: Number(e.target.value) })
              }
              className="mt-2 w-full accent-[var(--color-primary)]"
            />
          </label>

          <label className="block text-sm">
            Baseline window:{" "}
            <span className="tabular-nums">{config.baselineWindow / 2} hours</span>
            <input
              type="range"
              min={48}
              max={192}
              step={8}
              value={config.baselineWindow}
              onChange={(e) =>
                setConfig({ ...config, baselineWindow: Number(e.target.value) })
              }
              className="mt-2 w-full accent-[var(--color-primary)]"
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
