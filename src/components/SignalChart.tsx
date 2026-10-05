import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Baseline, VitalSample } from "@/lib/compute";
import { formatUtc } from "@/lib/compute";
import { SIGNAL_BY_KEY, type SignalKey } from "@/lib/signals";

export function SignalChart({
  signal,
  history,
  baseline,
  height = 300,
}: {
  signal: SignalKey;
  history: VitalSample[];
  baseline: Baseline;
  height?: number;
}) {
  const meta = SIGNAL_BY_KEY[signal];
  const data = history.map((h) => ({
    t: formatUtc(h.timestamp),
    value: Number((h[signal] as number).toFixed(meta.decimals + 1)),
    band: [baseline.lower, baseline.upper] as [number, number],
  }));

  if (data.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No telemetry available.
      </p>
    );
  }

  return (
    <div style={{ height }} aria-label={`${meta.label} over time with baseline band`}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="t"
            tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
            minTickGap={48}
            stroke="var(--color-border)"
          />
          <YAxis
            domain={["auto", "auto"]}
            tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
            stroke="var(--color-border)"
            width={48}
          />
          <Tooltip
            contentStyle={{
              background: "var(--color-popover)",
              border: "1px solid var(--color-border)",
              borderRadius: 12,
              color: "var(--color-popover-foreground)",
              fontSize: 12,
            }}
            formatter={(v: unknown) => [`${v} ${meta.unit}`, meta.label]}
          />
          <Area
            dataKey="band"
            stroke="none"
            fill="var(--color-primary)"
            fillOpacity={0.12}
            isAnimationActive={false}
            activeDot={false}
          />
          <ReferenceLine
            y={baseline.mean}
            stroke="var(--color-primary)"
            strokeDasharray="4 4"
            strokeOpacity={0.7}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--color-primary)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
