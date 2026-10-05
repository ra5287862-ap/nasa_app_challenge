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
      <section className="glass-panel overflow-x-auto p-5">
        <h2 className="font-display text-sm uppercase tracking-wider text-muted-foreground">
          Mission days 1–{today}
        </h2>
        <div className="mt-6 flex min-w-max items-start gap-6 pb-2">
          {days.map((d) => {
            const dayAlerts = alerts.filter((a) => missionDay(a.timestamp) === d);
            const multi = dayAlerts.some((a) => a.rule === "MULTI_SIGNAL_48H");
            const color = multi
              ? "bg-alert text-alert"
              : dayAlerts.length
                ? "bg-warning text-warning"
                : "bg-normal text-normal";
            return (
              <div key={d} className="w-28 text-center">
                <span className={`status-dot mx-auto ${color}`} aria-hidden />
                <p className="mt-2 text-xs text-muted-foreground">Day {d}</p>
                <p className="text-[11px]">
                  {multi ? "Multi-signal" : dayAlerts.length ? "Deviation" : "Normal"}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-6 space-y-3">
        {alerts.length === 0 ? (
          <p className="glass-panel p-6 text-sm text-muted-foreground">
            No events recorded yet in this replay.
          </p>
        ) : (
          alerts.map((a) => (
            <Link
              key={a.alert_id}
              to="/alerts/$alertId"
              params={{ alertId: a.alert_id }}
              className="glass-panel flex flex-wrap items-center justify-between gap-2 p-4 transition-colors hover:bg-accent/20"
            >
              <span className="text-sm">
                <span className={a.rule === "MULTI_SIGNAL_48H" ? "text-alert" : "text-warning"}>
                  {a.rule === "MULTI_SIGNAL_48H" ? "⚠ Multi-signal 48h" : "⚠ Deviation"}
                </span>{" "}
                ·{" "}
                {a.signals.map((s) => SIGNAL_BY_KEY[s.signal].label).join(", ")}
              </span>
              <span className="text-xs text-muted-foreground tabular-nums">
                Day {missionDay(a.timestamp)} · {formatDateUtc(a.timestamp)}
              </span>
            </Link>
          ))
        )}
      </section>
    </AppShell>
  );
}
