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
      <div className="mb-4 rounded-xl border border-cyan-500/30 bg-[#08131B]/30 p-4 text-[#E5EEF2] shadow-[0_4px_20px_-4px_rgba(5,10,15,0.4)] backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-mono font-bold text-cyan-300 glow-cyan-text">
              ALEX'S 6 MONITORED PHYSIOLOGICAL SIGNALS VS. INDIVIDUAL BASELINE BANDS
            </p>
            <p className="text-[11px] text-[#7F98A3] mt-1 font-sans">
              The shaded band behind each curve represents Alex’s personal baseline range (mean ± {config.threshold}σ).
              Alerts fire only when measurements breach Alex&apos;s own baseline limits.
            </p>
          </div>
          <span className="rounded-lg border border-cyan-500/30 bg-[#040A10]/50 backdrop-blur-sm px-3 py-1 text-xs font-mono text-cyan-400 font-semibold shadow-[0_0_10px_rgba(34,211,238,0.15)]">
            THRESHOLD: ±{config.threshold.toFixed(1)}σ
          </span>
        </div>
      </div>

      <div className="mb-6 flex justify-end">
        <ReplayControls />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {SIGNALS.map((s) => (
          <section key={s.key} className="bg-[#08131B]/25 border border-cyan-500/20 rounded-xl p-5 shadow-[0_4px_24px_-4px_rgba(5,10,15,0.4)] backdrop-blur-md transition-all hover:bg-[#08131B]/40 hover:border-cyan-400/40 hover:shadow-[0_0_24px_rgba(34,211,238,0.1)]">
            <header className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-mono text-xs uppercase tracking-wider text-[#7F98A3] flex items-center gap-1.5">
                  <span aria-hidden className="text-sm">{s.icon}</span> {s.label}
                </h2>
                <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-cyan-400 glow-cyan-text">
                  {current ? (current[s.key] as number).toFixed(s.decimals) : "—"}{" "}
                  <span className="text-sm font-normal text-[#7F98A3]">
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
            <p className="mt-2 text-xs text-[#7F98A3] font-mono tabular-nums">
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
