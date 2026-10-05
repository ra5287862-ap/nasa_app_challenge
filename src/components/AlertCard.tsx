import { Link } from "@tanstack/react-router";
import { AlertTriangle, Layers } from "lucide-react";
import type { HealthAlert } from "@/lib/compute";
import { formatDateUtc, missionDay } from "@/lib/compute";
import { SIGNAL_BY_KEY } from "@/lib/signals";

export function AlertBadge({ alert }: { alert: HealthAlert }) {
  const multi = alert.rule === "MULTI_SIGNAL_48H";
  const Icon = multi ? Layers : AlertTriangle;
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${
        multi
          ? "border-alert/40 bg-alert/15 text-alert"
          : "border-warning/40 bg-warning/15 text-warning"
      }`}
    >
      <Icon className="size-3.5" aria-hidden />
      {multi ? `MULTI-SIGNAL ${alert.window_hours}H` : "SIGNAL DEVIATION"}
    </span>
  );
}

export function AlertCard({ alert }: { alert: HealthAlert }) {
  return (
    <article className="glass-panel p-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <AlertBadge alert={alert} />
        <p className="text-xs text-muted-foreground tabular-nums">
          Day {missionDay(alert.timestamp)} · {formatDateUtc(alert.timestamp)}
        </p>
      </header>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {alert.signals.map((s) => {
          const meta = SIGNAL_BY_KEY[s.signal];
          return (
            <div
              key={s.signal}
              className="rounded-lg border border-border/60 bg-panel/40 p-3"
            >
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                {meta.icon} {meta.label}
              </dt>
              <dd className="mt-1 font-display text-xl tabular-nums">
                {s.value.toFixed(meta.decimals)} {meta.unit}
              </dd>
              <dd className="mt-1 text-xs text-muted-foreground tabular-nums">
                Baseline {s.baseline_mean.toFixed(meta.decimals)} {meta.unit} ·
                z-score {s.z_score.toFixed(2)}
              </dd>
            </div>
          );
        })}
      </dl>

      <div className="mt-4">
        <Link
          to="/alerts/$alertId"
          params={{ alertId: alert.alert_id }}
          className="inline-flex items-center rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-sm text-primary transition-colors hover:bg-primary/20"
        >
          View details
        </Link>
      </div>
    </article>
  );
}
