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

      <section className="glass-panel mt-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <AlertBadge alert={alert} />
          <p className="text-xs text-muted-foreground tabular-nums">
            {alert.alert_id} · Day {missionDay(alert.timestamp)} ·{" "}
            {formatDateUtc(alert.timestamp)}
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {alert.signals.map((s) => {
            const meta = SIGNAL_BY_KEY[s.signal];
            return (
              <div
                key={s.signal}
                className="rounded-xl border border-border/60 bg-panel/40 p-4"
              >
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {meta.icon} {meta.label}
                </p>
                <p className="mt-1 font-display text-2xl tabular-nums">
                  {s.value.toFixed(meta.decimals)} {meta.unit}
                </p>
                <dl className="mt-2 space-y-1 text-xs text-muted-foreground tabular-nums">
                  <div className="flex justify-between">
                    <dt>Baseline mean</dt>
                    <dd>
                      {s.baseline_mean.toFixed(meta.decimals)} {meta.unit}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Baseline std</dt>
                    <dd>{s.baseline_std.toFixed(2)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Z-score</dt>
                    <dd className="text-alert">{s.z_score.toFixed(2)}</dd>
                  </div>
                </dl>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/30 px-3.5 py-2 text-xs text-muted-foreground">
          <div>
            Rule: <strong className="text-foreground">{alert.rule}</strong> ·
            Threshold: <strong className="text-primary">{alert.threshold.toFixed(1)}σ</strong>
            {alert.window_hours ? ` · Detection window: ${alert.window_hours}h` : ""}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-medium">● Deterministic Rule Fired: TRUE</span>
            <span className="text-border">|</span>
            <span className="text-muted-foreground">Target: Astronaut Alex</span>
          </div>
        </div>
      </section>

      {/* Explanation Agent */}
      <section className="glass-panel mt-6 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-accent/20 text-accent font-bold text-xs">
              🤖
            </span>
            <div>
              <h2 className="font-display text-sm uppercase tracking-wider text-accent font-semibold">
                Explanation Agent
              </h2>
              <p className="text-[11px] text-muted-foreground">
                AI Contextualizer (Constrained to NASA OSDR Metadata)
              </p>
            </div>
          </div>
          <button
            onClick={() => setExplanation(explainAlert(alert))}
            className="inline-flex items-center gap-1.5 rounded-lg border border-primary/50 bg-primary/15 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/25"
          >
            <Sparkles className="size-3.5" aria-hidden /> Explain Alert
          </button>
        </div>

        <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
          Explains rule firings in plain language without diagnosing.
          <strong className="text-foreground"> Guardrail: AI ≠ Doctor.</strong> All diagnostic, disease and prescription terminology is blocked by an automated post-generation safety filter.
        </p>

        {explanation ? (
          <div className="mt-3 space-y-2">
            <div className="rounded-lg border border-border/80 bg-panel/80 p-3 text-xs leading-relaxed text-foreground whitespace-pre-line font-sans">
              {explanation.text}
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
              <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                🛡️ Guardrail Post-Check: {explanation.passed ? "PASSED (Clean)" : "BLOCKED (Safe fallback)"}
              </span>
              <span>No diagnostic directives</span>
            </div>
          </div>
        ) : (
          <div className="mt-3 rounded-lg border border-dashed border-border/80 p-4 text-center text-xs text-muted-foreground">
            Click &quot;Explain Alert&quot; to prompt the Explanation Agent.
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
                className="flex flex-col justify-between rounded-xl border border-border/60 bg-panel/40 p-4"
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
