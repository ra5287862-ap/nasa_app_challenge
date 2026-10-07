import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AlertCard } from "@/components/AlertCard";
import { useMission } from "@/lib/mission-store";

export const Route = createFileRoute("/alerts/")({
  head: () => ({
    meta: [
      { title: "Alert Center — Crew Health Console" },
      {
        name: "description",
        content:
          "Complete history of personal-baseline deviations and multi-signal 48-hour events for the crew.",
      },
      { property: "og:title", content: "Alert Center — Crew Health Console" },
      {
        property: "og:description",
        content: "Filterable history of single-signal and multi-signal baseline deviations.",
      },
    ],
  }),
  component: AlertsPage,
});

const FILTERS = ["All", "Single signal", "Multi signal", "Recent"] as const;

function AlertsPage() {
  const { alerts, current } = useMission();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const filtered = alerts.filter((a) => {
    if (filter === "Single signal") return a.rule === "Z_SCORE_DEVIATION";
    if (filter === "Multi signal") return a.rule === "MULTI_SIGNAL_48H";
    if (filter === "Recent")
      return current ? current.timestamp - a.timestamp <= 48 * 3600 * 1000 : true;
    return true;
  });

  return (
    <AppShell title="Alert Center">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Alert filters">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={`rounded-lg border px-3.5 py-1.5 text-xs font-mono font-medium transition-all ${
              filter === f
                ? "border-cyan-400/60 bg-cyan-400/20 text-cyan-300 font-semibold shadow-[0_0_12px_rgba(34,211,238,0.25)]"
                : "border-cyan-500/20 bg-[#0B1821]/40 backdrop-blur-md text-[#7F98A3] hover:text-[#E5EEF2] hover:bg-cyan-500/10"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-4">
        {filtered.length === 0 ? (
          <p className="glass-panel p-6 text-sm text-muted-foreground">
            No alerts match this filter.
          </p>
        ) : (
          filtered.map((a) => <AlertCard key={a.alert_id} alert={a} />)
        )}
      </div>
    </AppShell>
  );
}
