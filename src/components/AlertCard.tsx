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
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-mono font-semibold tracking-wider ${
        multi
          ? "border-red-500/60 bg-red-500/20 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.3)] uppercase"
          : "border-amber-500/50 bg-amber-500/20 text-amber-400 uppercase"
      }`}
    >
      <Icon className="size-3.5" aria-hidden />
      {multi ? `⚠ CRITICAL OUTLIER (${alert.window_hours}H)` : "SIGNAL DEVIATION"}
    </span>
  );
}

export function AlertCard({ alert }: { alert: HealthAlert }) {
  const multi = alert.rule === "MULTI_SIGNAL_48H";

  return (
    <article
      className={`p-4 rounded-xl backdrop-blur-md transition-all duration-300 ${
        multi
          ? "bg-[#16080C]/35 border border-red-500/60 text-red-200 shadow-[0_0_20px_-5px_rgba(239,68,68,0.25)] hover:bg-[#16080C]/50"
          : "bg-[#08131B]/25 border border-amber-500/30 text-[#E5EEF2] shadow-[0_4px_20px_-5px_rgba(5,10,15,0.4)] hover:bg-[#08131B]/40 hover:border-amber-500/50"
      }`}
    >
      <header className="flex flex-wrap items-center justify-between gap-2">
        <AlertBadge alert={alert} />
        <p className="text-xs text-[#7F98A3] font-mono tabular-nums">
          Day {missionDay(alert.timestamp)} · {formatDateUtc(alert.timestamp)}
        </p>
      </header>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {alert.signals.map((s) => {
          const meta = SIGNAL_BY_KEY[s.signal];
          return (
            <div
              key={s.signal}
              className={`rounded-lg p-3 ${
                multi
                  ? "border border-red-500/30 bg-[#16080C]/30"
                  : "border border-cyan-500/20 bg-[#0B1821]/30"
              }`}
            >
              <dt className="text-xs uppercase font-mono tracking-wider text-[#7F98A3]">
                {meta.icon} {meta.label}
              </dt>
              <dd
                className={`mt-1 font-mono text-2xl font-bold tabular-nums ${
                  multi ? "text-red-400 glow-alert-text" : "text-amber-400"
                }`}
              >
                {s.value.toFixed(meta.decimals)} {meta.unit}
              </dd>
              <dd className="mt-1 text-xs text-[#7F98A3] font-mono tabular-nums">
                Baseline {s.baseline_mean.toFixed(meta.decimals)} {meta.unit} ·
                <span className={multi ? " text-red-300 font-bold ml-1" : " text-amber-300 font-bold ml-1"}>
                  z = {s.z_score.toFixed(2)}σ
                </span>
              </dd>
            </div>
          );
        })}
      </dl>

      <div className="mt-4 flex items-center justify-between">
        <Link
          to="/alerts/$alertId"
          params={{ alertId: alert.alert_id }}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-mono font-semibold transition-all ${
            multi
              ? "border border-red-500/50 bg-red-500/15 text-red-300 hover:bg-red-500/25 hover:border-red-500/80"
              : "border border-cyan-400/40 bg-cyan-400/10 text-cyan-300 hover:bg-cyan-400/20"
          }`}
        >
          View Telemetry & AI Context →
        </Link>
      </div>
    </article>
  );
}
