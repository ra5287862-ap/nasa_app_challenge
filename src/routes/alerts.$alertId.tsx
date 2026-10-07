import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ExternalLink, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AlertBadge } from "@/components/AlertCard";
import { useMission } from "@/lib/mission-store";
import { formatDateUtc, missionDay } from "@/lib/compute";
import { SIGNAL_BY_KEY } from "@/lib/signals";
import { explainAlert, type ExplanationResult } from "@/lib/explanation";

export const Route = createFileRoute("/alerts/$alertId")({
  head: () => ({
    meta: [
      { title: "Alert Details — Crew Health Console" },
      {
        name: "description",
        content:
          "Exact measured values, personal baseline statistics and plain-language explanation for a single baseline deviation alert.",
      },
      { property: "og:title", content: "Alert Details — Crew Health Console" },
      {
        property: "og:description",
        content: "Deviation values, z-scores and related NASA OSDR studies for one alert.",
      },
    ],
  }),
  component: AlertDetails,
});

function AlertDetails() {
  const { alertId } = Route.useParams();
  const { alerts } = useMission();
  const alert = alerts.find((a) => a.alert_id === alertId);
  const [explanation, setExplanation] = useState<ExplanationResult | null>(null);

  if (!alert) {
    return (
      <AppShell title="Alert Details">
        <p className="glass-panel p-6 text-sm text-muted-foreground">
          This alert is not in the current replay window. Restart the replay or open the
          alert center.
        </p>
        <Link to="/alerts" className="mt-4 inline-block text-sm text-primary">
          ← Back to alerts
        </Link>
      </AppShell>
    );
  }

  return (
    <AppShell title="Alert Details">
      <Link
        to="/alerts"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden /> Back to alerts
      </Link>

      <section
        className={`mt-4 p-5 rounded-xl backdrop-blur-md transition-all ${
          alert.rule === "MULTI_SIGNAL_48H"
            ? "bg-[#16080C]/35 border border-red-500/60 shadow-[0_0_20px_-5px_rgba(239,68,68,0.25)]"
            : "bg-[#08131B]/25 border border-cyan-500/20 text-[#E5EEF2] shadow-[0_4px_24px_-4px_rgba(5,10,15,0.4)]"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <AlertBadge alert={alert} />
          <p className="text-xs text-[#7F98A3] font-mono tabular-nums">
            {alert.alert_id} · Day {missionDay(alert.timestamp)} ·{" "}
            {formatDateUtc(alert.timestamp)}
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {alert.signals.map((s) => {
            const meta = SIGNAL_BY_KEY[s.signal];
            const isCritical = alert.rule === "MULTI_SIGNAL_48H";
            return (
              <div
                key={s.signal}
                className={`rounded-xl p-4 backdrop-blur-sm ${
                  isCritical
                    ? "border border-red-500/30 bg-[#16080C]/30"
                    : "border border-cyan-500/20 bg-[#0B1821]/30"
                }`}
              >
                <p className="text-xs font-mono uppercase tracking-wider text-[#7F98A3]">
                  {meta.icon} {meta.label}
                </p>
                <p
                  className={`mt-1 font-mono text-2xl font-bold tabular-nums ${
                    isCritical ? "text-red-400 glow-alert-text" : "text-cyan-400 glow-cyan-text"
                  }`}
                >
                  {s.value.toFixed(meta.decimals)} {meta.unit}
                </p>
                <dl className="mt-2 space-y-1 text-xs text-[#7F98A3] font-mono tabular-nums">
                  <div className="flex justify-between">
                    <dt>Baseline mean</dt>
                    <dd className="text-[#E5EEF2]">
                      {s.baseline_mean.toFixed(meta.decimals)} {meta.unit}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Baseline std</dt>
                    <dd className="text-[#E5EEF2]">{s.baseline_std.toFixed(2)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Z-score</dt>
                    <dd className={isCritical ? "text-red-400 font-bold" : "text-amber-400 font-bold"}>
                      {s.z_score.toFixed(2)}σ
                    </dd>
                  </div>
                </dl>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-cyan-500/20 bg-[#040A10]/40 px-3.5 py-2 text-xs text-[#7F98A3] font-mono backdrop-blur-sm">
          <div>
            Rule: <strong className="text-[#E5EEF2]">{alert.rule}</strong> ·
            Threshold: <strong className="text-cyan-400">{alert.threshold.toFixed(1)}σ</strong>
            {alert.window_hours ? ` · Detection window: ${alert.window_hours}h` : ""}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-medium">● Deterministic Rule Fired: TRUE</span>
            <span className="text-cyan-500/30">|</span>
            <span className="text-[#7F98A3]">Target: Astronaut Alex</span>
          </div>
        </div>
      </section>

      {/* AI Explanation Layer - Purple Theme */}
      <section className="mt-6 rounded-xl border border-purple-500/35 bg-[#0D0B18]/30 p-5 text-slate-200 shadow-[0_0_20px_-5px_rgba(139,92,246,0.18)] backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-lg border border-purple-500/40 bg-purple-500/20 text-purple-300 font-bold text-sm shadow-[0_0_10px_rgba(139,92,246,0.3)]">
              🤖
            </span>
            <div>
              <span className="text-purple-400 text-xs font-mono font-semibold tracking-wider block">
                AI EXPLANATION LAYER
              </span>
              <p className="text-slate-300 text-xs">
                Evidence-grounded telemetry interpretation (Constrained to NASA OSDR Metadata)
              </p>
            </div>
          </div>
          <button
            onClick={() => setExplanation(explainAlert(alert))}
            className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/50 bg-purple-500/20 px-3.5 py-1.5 text-xs font-mono font-semibold text-purple-200 transition-all hover:bg-purple-500/30 hover:border-purple-400 hover:shadow-[0_0_15px_rgba(139,92,246,0.35)] active:scale-95"
          >
            <Sparkles className="size-3.5 text-purple-300" aria-hidden /> Explain Alert
          </button>
        </div>

        <p className="mt-3 text-xs text-[#7F98A3] leading-relaxed">
          Explains rule firings in plain language without diagnosing.
          <strong className="text-[#E5EEF2]"> Guardrail: AI ≠ Doctor.</strong> All diagnostic, disease and prescription terminology is blocked by an automated post-generation safety filter.
        </p>

        {explanation ? (
          <div className="mt-3 space-y-2">
            <div className="rounded-lg border border-purple-500/30 bg-[#0B0818]/45 p-4 text-xs leading-relaxed text-[#E5EEF2] whitespace-pre-line font-sans shadow-inner backdrop-blur-sm">
              {explanation.text}
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#7F98A3] font-mono px-1">
              <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                🛡️ Guardrail Post-Check: {explanation.passed ? "PASSED (Clean)" : "BLOCKED (Safe fallback)"}
              </span>
              <span>No diagnostic directives</span>
            </div>
          </div>
        ) : (
          <div className="mt-3 rounded-lg border border-dashed border-purple-500/30 bg-[#0B0818]/25 p-4 text-center text-xs font-mono text-[#7F98A3] backdrop-blur-sm">
            Click &quot;Explain Alert&quot; to prompt the AI Explanation Layer.
          </div>
        )}
      </section>

      {/* NASA OSDR Evidence */}
      <section className="glass-panel mt-6 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-sm uppercase tracking-wider text-muted-foreground">
              📚 NASA OSDR &amp; GeneLab Research Evidence
            </h2>
            <p className="text-xs text-muted-foreground">
              Peer-reviewed spaceflight biology and human research studies cited for this alert
            </p>
          </div>
          <span className="rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            Verified NASA Literature
          </span>
        </div>

        {(!explanation || explanation.studies.length === 0) ? (
          <p className="mt-4 text-xs text-muted-foreground">
            Click &quot;Explain Alert&quot; above to view peer-reviewed study correlations.
          </p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {explanation.studies.map((s) => (
              <li
                key={s.id}
                className="flex flex-col justify-between rounded-xl border border-cyan-500/20 bg-[#08131B]/25 p-4 backdrop-blur-md hover:bg-[#08131B]/40 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-semibold text-primary">{s.id}</span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                      NASA OSDR
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm font-medium leading-snug">{s.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{s.description}</p>
                </div>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                >
                  View full NASA study <ExternalLink className="size-3" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
