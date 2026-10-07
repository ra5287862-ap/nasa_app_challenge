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
      label: "NOMINAL",
      icon: "●",
      cls: "border-emerald-500/40 bg-emerald-500/15 text-emerald-400",
    },
    deviation: {
      label: "DEVIATION",
      icon: "⚠",
      cls: "border-amber-500/50 bg-amber-500/20 text-amber-400 font-semibold tracking-wide",
    },
    multi_signal: {
      label: "CRITICAL OUTLIER",
      icon: "⚡",
      cls: "border-red-500/60 bg-red-500/20 text-red-400 vital-card-multisignal-badge font-semibold tracking-wide",
    },
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-mono tracking-wide ${config.cls}`}
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
    "bg-[#08131B]/25 border border-cyan-500/20 text-[#E5EEF2] p-4 rounded-xl backdrop-blur-md transition-all duration-300 shadow-[0_4px_24px_-4px_rgba(5,10,15,0.4)] hover:bg-[#08131B]/40",
    status === "multi_signal"
      ? "vital-card-multisignal"
      : status === "deviation"
        ? "vital-card-deviation"
        : "hover:border-cyan-400/40 hover:shadow-[0_0_24px_rgba(34,211,238,0.12)]",
  ]
    .filter(Boolean)
    .join(" ");

  const strokeColor =
    status === "multi_signal"
      ? "#EF4444"
      : status === "deviation"
        ? "#F59E0B"
        : "#22D3EE";

  const valueColorCls =
    status === "multi_signal"
      ? "text-red-400 glow-alert-text"
      : status === "deviation"
        ? "text-amber-400"
        : "text-cyan-400 glow-cyan-text";

  return (
    <article
      className={containerCls}
      aria-label={`${meta.label}: ${value.toFixed(meta.decimals)} ${meta.unit}. Status: ${status.replace("_", " ")}`}
    >
      <header className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-xs uppercase font-mono tracking-wider text-[#7F98A3]">
          <span aria-hidden className="text-base">{meta.icon}</span>
          {meta.label}
        </span>
        <StatusBadge status={status} />
      </header>

      <h3 className={`mt-3 font-mono text-3xl font-bold tabular-nums flex items-baseline gap-1.5 ${valueColorCls}`}>
        {value.toFixed(meta.decimals)}
        <span className="text-sm font-normal text-[#7F98A3]">
          {meta.unit}
        </span>
      </h3>

      <p className="mt-1 text-xs text-[#7F98A3] font-mono tabular-nums">
        Baseline {baseline.lower.toFixed(meta.decimals)}–
        {baseline.upper.toFixed(meta.decimals)} {meta.unit}
        {deviating && (
          <span className={status === "multi_signal" ? "text-red-400 font-bold ml-2" : "text-amber-400 font-bold ml-2"}>
            · z {z.toFixed(2)}σ
          </span>
        )}
      </p>

      {status === "multi_signal" && (
        <p className="mt-2 text-xs font-mono font-semibold text-red-400 animate-pulse">
          ⚡ CRITICAL OUTLIER: Multiple signals deviating
        </p>
      )}

      {status === "deviation" && (
        <p className="mt-2 text-xs font-mono text-amber-400">
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
