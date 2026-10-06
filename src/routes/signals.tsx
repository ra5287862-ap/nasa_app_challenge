import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { SignalChart } from "@/components/SignalChart";
import { StatusPill } from "@/components/VitalCard";
import { ReplayControls } from "@/components/ReplayControls";
import { useMission } from "@/lib/mission-store";
import { SIGNALS } from "@/lib/signals";

export const Route = createFileRoute("/signals")({
  head: () => ({
    meta: [
      { title: "Live Signals — Crew Health Console" },
      {
        name: "description",
        content:
          "Detailed charts for heart rate, HRV, SpO2, sleep, core temperature and exercise with personal baseline bands.",
      },
      { property: "og:title", content: "Live Signals — Crew Health Console" },
      {
        property: "og:description",
        content: "Six monitored signals charted against their personal baseline bands.",
      },
    ],
  }),
  component: SignalsPage,
});

function SignalsPage() {
  const { history, baselines, zScores, config, current, deviatingNow } = useMission();

  return (
    <AppShell title="Live Health Signals — Astronaut Alex">
      {/* Story Narrative Box */}
      <div className="mb-4 rounded-xl border border-primary/30 bg-primary/10 p-3.5 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-foreground">
              Alex's 6 Monitored Physiological Signals vs. Individual Baseline Bands
            </p>
            <p className="text-[11px] text-muted-foreground">
              The shaded band behind each curve represents Alex’s personal baseline range (mean ± {config.threshold}σ).
              Alerts fire only when measurements breach Alex&apos;s own baseline limits.
            </p>
          </div>
          <span className="rounded-lg border border-border/80 bg-panel px-2.5 py-1 text-xs font-mono text-primary font-medium">
            Threshold: ±{config.threshold.toFixed(1)}σ
          </span>
        </div>
      </div>

      <div className="mb-6 flex justify-end">
        <ReplayControls />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {SIGNALS.map((s) => (
          <section key={s.key} className="glass-panel p-5">
            <header className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-sm uppercase tracking-wider text-muted-foreground">
                  <span aria-hidden>{s.icon}</span> {s.label}
                </h2>
                <p className="mt-1 font-display text-2xl tabular-nums">
                  {current ? (current[s.key] as number).toFixed(s.decimals) : "—"}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    {s.unit}
                  </span>
                </p>
              </div>
              <StatusPill
                z={zScores[s.key]}
                threshold={config.threshold}
                isMultiSignal={deviatingNow.length >= 2 && deviatingNow.includes(s.key)}
              />
            </header>
            <div className="mt-3">
              <SignalChart
                signal={s.key}
                history={history}
                baseline={baselines[s.key]}
                height={220}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground tabular-nums">
              Mean {baselines[s.key].mean.toFixed(s.decimals)} · band{" "}
              {baselines[s.key].lower.toFixed(s.decimals)}–
              {baselines[s.key].upper.toFixed(s.decimals)} {s.unit}
            </p>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
