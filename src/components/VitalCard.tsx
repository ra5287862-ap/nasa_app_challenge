import { Line, LineChart, ResponsiveContainer } from "recharts";
import type { Baseline, VitalSample } from "@/lib/compute";
import { SIGNAL_BY_KEY, type SignalKey } from "@/lib/signals";

export type CardStatus = "normal" | "deviation" | "multi_signal";

/**
 * Determines the three-tier card status from z-score and multi-signal flag.
 * Multi-signal detection is owned by the compute layer — this component
 * only DISPLAYS the pre-computed state, never calculates it.
 */
export function resolveCardStatus(
  z: number,
  threshold: number,
  isMultiSignal: boolean,
): CardStatus {
  if (isMultiSignal && Math.abs(z) >= threshold) return "multi_signal";
  if (Math.abs(z) >= threshold) return "deviation";
  return "normal";
}

function StatusBadge({ status }: { status: CardStatus }) {
  const config = {
    normal: {
      label: "Normal",
      icon: "●",
      cls: "border-normal/40 bg-normal/15 text-normal",
    },
    deviation: {
      label: "Deviation",
      icon: "⚠",
      cls: "border-warning/40 bg-warning/15 text-warning",
    },
    multi_signal: {
      label: "Multi-Signal",
      icon: "⚡",
      cls: "border-alert/60 bg-alert/20 text-alert vital-card-multisignal-badge",
    },
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-wide ${config.cls}`}
      aria-label={`Status: ${config.label}`}
    >
      <span aria-hidden>{config.icon}</span>
      {config.label}
    </span>
  );
}

export function VitalCard({
  signal,
  value,
  baseline,
  z,
  threshold,
  history,
  isMultiSignal = false,
}: {
  signal: SignalKey;
  value: number;
  baseline: Baseline;
  z: number;
  threshold: number;
  history: VitalSample[];
  /** Pass true when a MULTI_SIGNAL_48H alert is active and this signal is involved */
  isMultiSignal?: boolean;
}) {
  const meta = SIGNAL_BY_KEY[signal];
  const spark = history.slice(-40).map((h, i) => ({ i, v: h[signal] as number }));
  const status = resolveCardStatus(z, threshold, isMultiSignal);
  const deviating = status !== "normal";

  const containerCls = [
    "glass-panel p-4 transition-all duration-500",
    status === "multi_signal"
      ? "vital-card-multisignal"
      : status === "deviation"
        ? "vital-card-deviation"
        : "",
  ]
    .filter(Boolean)
    .join(" ");

  const strokeColor =
    status === "multi_signal"
      ? "var(--color-alert)"
      : status === "deviation"
        ? "var(--color-warning)"
        : "var(--color-primary)";

  return (
    <article
      className={containerCls}
      aria-label={`${meta.label}: ${value.toFixed(meta.decimals)} ${meta.unit}. Status: ${status.replace("_", " ")}`}
    >
      <header className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          <span aria-hidden>{meta.icon}</span>
          {meta.label}
        </p>
        <StatusBadge status={status} />
      </header>

      <p className="mt-3 font-display text-3xl font-semibold tabular-nums">
        {value.toFixed(meta.decimals)}
        <span className="ml-1 text-sm font-normal text-muted-foreground">
          {meta.unit}
        </span>
      </p>

      <p className="mt-1 text-xs text-muted-foreground tabular-nums">
        Baseline {baseline.lower.toFixed(meta.decimals)}–
        {baseline.upper.toFixed(meta.decimals)} {meta.unit}
        {deviating && (
          <span className={status === "multi_signal" ? "text-alert ml-2" : "text-warning ml-2"}>
            · z {z.toFixed(2)}σ
          </span>
        )}
      </p>

      {status === "multi_signal" && (
        <p className="mt-2 text-xs font-medium text-alert animate-pulse">
          ⚡ Multiple health signals deviating
        </p>
      )}

      {status === "deviation" && (
        <p className="mt-2 text-xs text-warning">
          ⚠ {z > 0 ? "Above" : "Below"} personal baseline
        </p>
      )}

      <div className="mt-3 h-12" aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={spark}>
            <Line
              type="monotone"
              dataKey="v"
              dot={false}
              strokeWidth={2}
              stroke={strokeColor}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}

/**
 * Convenience pill for the Live Signals page: derives CardStatus from
 * a raw z-score + threshold and renders the corresponding badge.
 */
export function StatusPill({
  z,
  threshold,
  isMultiSignal = false,
}: {
  z: number;
  threshold: number;
  isMultiSignal?: boolean;
}) {
  const status = resolveCardStatus(z, threshold, isMultiSignal);
  return <StatusBadge status={status} />;
}
