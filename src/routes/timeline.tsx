import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useMission } from "@/lib/mission-store";
import { formatDateUtc, missionDay } from "@/lib/compute";
import { SIGNAL_BY_KEY } from "@/lib/signals";

export const Route = createFileRoute("/timeline")({
  head: () => ({
    meta: [
      { title: "Mission Timeline — Crew Health Console" },
      {
        name: "description",
        content:
          "Health events plotted across the mission timeline, from normal periods to single and multi-signal baseline deviations.",
      },
      { property: "og:title", content: "Mission Timeline — Crew Health Console" },
      {
        property: "og:description",
        content: "Baseline deviation events across the mission days.",
      },
    ],
  }),
  component: TimelinePage,
});

function TimelinePage() {
  const { alerts, current } = useMission();
  const today = current ? missionDay(current.timestamp) : 1;
  const days = Array.from({ length: today }, (_, i) => i + 1);

  return (
    <AppShell title="Mission Timeline">
      <section className="bg-[#08131B]/25 border border-cyan-500/20 rounded-xl overflow-x-auto p-5 shadow-[0_4px_24px_-4px_rgba(5,10,15,0.7)] backdrop-blur-md">
        <h2 className="font-mono text-xs uppercase tracking-wider text-[#7F98A3]">
          Mission days 1–{today}
        </h2>
        <div className="mt-6 flex min-w-max items-start gap-6 pb-2">
          {days.map((d) => {
            const dayAlerts = alerts.filter((a) => missionDay(a.timestamp) === d);
            const multi = dayAlerts.some((a) => a.rule === "MULTI_SIGNAL_48H");
            const color = multi
              ? "bg-[#EF4444] text-[#EF4444]"
              : dayAlerts.length
                ? "bg-[#F59E0B] text-[#F59E0B]"
                : "bg-[#22C55E] text-[#22C55E]";
            return (
              <div key={d} className="w-28 text-center font-mono">
                <span className={`status-dot mx-auto ${color}`} aria-hidden />
                <p className="mt-2 text-xs text-[#7F98A3]">Day {d}</p>
                <p className={`text-[11px] font-semibold ${multi ? "text-red-400" : dayAlerts.length ? "text-amber-400" : "text-emerald-400"}`}>
                  {multi ? "CRITICAL" : dayAlerts.length ? "Deviation" : "Nominal"}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-6 space-y-3 font-mono">
        {alerts.length === 0 ? (
          <p className="bg-[#08131B]/25 border border-cyan-500/20 rounded-xl p-6 text-sm text-[#7F98A3] backdrop-blur-md">
            No events recorded yet in this replay.
          </p>
        ) : (
          alerts.map((a) => {
            const isMulti = a.rule === "MULTI_SIGNAL_48H";
            return (
              <Link
                key={a.alert_id}
                to="/alerts/$alertId"
                params={{ alertId: a.alert_id }}
                className={`flex flex-wrap items-center justify-between gap-2 p-4 rounded-xl border backdrop-blur-md transition-all ${
                  isMulti
                    ? "bg-[#16080C]/35 border-red-500/40 text-red-200 hover:border-red-500/80 hover:bg-[#16080C]/50"
                    : "bg-[#08131B]/25 border-amber-500/30 text-[#E5EEF2] hover:border-amber-500/60 hover:bg-[#08131B]/40"
                }`}
              >
                <span className="text-sm">
                  <span className={isMulti ? "text-red-400 font-bold" : "text-amber-400 font-bold"}>
                    {isMulti ? "⚠ CRITICAL OUTLIER (48H)" : "⚠ SIGNAL DEVIATION"}
                  </span>{" "}
                  ·{" "}
                  <span className="text-[#E5EEF2]">
                    {a.signals.map((s) => SIGNAL_BY_KEY[s.signal].label).join(", ")}
                  </span>
                </span>
                <span className="text-xs text-[#7F98A3] tabular-nums">
                  Day {missionDay(a.timestamp)} · {formatDateUtc(a.timestamp)}
                </span>
              </Link>
            );
          })
        )}
      </section>
    </AppShell>
  );
}
