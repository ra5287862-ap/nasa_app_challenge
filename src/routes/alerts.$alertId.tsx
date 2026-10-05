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

        <p className="mt-4 text-xs text-muted-foreground">
          Rule: {alert.rule} · threshold {alert.threshold.toFixed(1)}
          {alert.window_hours ? ` · detection window ${alert.window_hours} hours` : ""} ·
          data: SIMULATED
        </p>
      </section>

      <section className="glass-panel mt-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-sm uppercase tracking-wider text-muted-foreground">
            Explanation
          </h2>
          <button
            onClick={() => setExplanation(explainAlert(alert))}
            className="inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-sm text-primary transition-colors hover:bg-primary/20"
          >
            <Sparkles className="size-4" aria-hidden /> Explain this alert
          </button>
        </div>
        {explanation ? (
          <>
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed">
              {explanation.text}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              Safety check: {explanation.passed ? "passed" : "blocked — safe fallback shown"}
              . Diagnostic and treatment language is filtered before display.
            </p>
          </>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            Request a plain-language summary of what changed. The explanation layer
            receives only this alert and cached study metadata.
          </p>
        )}
      </section>

      {explanation && (
        <section className="glass-panel mt-4 p-5">
          <h2 className="font-display text-sm uppercase tracking-wider text-muted-foreground">
            Related NASA research
          </h2>
          {explanation.studies.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Research metadata unavailable.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {explanation.studies.map((s) => (
                <li
                  key={s.id}
                  className="rounded-xl border border-border/60 bg-panel/40 p-4"
                >
                  <p className="font-mono text-xs text-primary">{s.id}</p>
                  <p className="mt-1 text-sm font-medium">{s.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.description}</p>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                  >
                    View study <ExternalLink className="size-3" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </AppShell>
  );
}
