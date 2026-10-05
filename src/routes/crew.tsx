import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useMission, MISSION_NAME, CREW_ID } from "@/lib/mission-store";
import { missionDay } from "@/lib/compute";
import { SIGNALS } from "@/lib/signals";

export const Route = createFileRoute("/crew")({
  head: () => ({
    meta: [
      { title: "Crew Profile — CREW-01 · Mission AURORA-01" },
      {
        name: "description",
        content:
          "Crew member profile with mission status and personal baseline ranges for all six monitored health signals.",
      },
      { property: "og:title", content: "Crew Profile — CREW-01" },
      {
        property: "og:description",
        content: "Mission status and personal baseline ranges for the monitored crew member.",
      },
    ],
  }),
  component: CrewProfile,
});

function CrewProfile() {
  const { current, baselines, zScores, config } = useMission();
  const day = current ? missionDay(current.timestamp) : 1;

  const facts = [
    { label: "Crew ID", value: CREW_ID },
    { label: "Mission", value: MISSION_NAME },
    { label: "Mission day", value: String(day) },
    { label: "Monitoring", value: "ACTIVE" },
    { label: "Data", value: "SIMULATED" },
  ];

  return (
    <AppShell title="Crew Profile">
      <section className="glass-panel grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-5">
        {facts.map((f) => (
          <div key={f.label}>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {f.label}
            </p>
            <p className="mt-1 font-display text-lg">{f.value}</p>
          </div>
        ))}
      </section>

      <section className="glass-panel mt-6 overflow-hidden p-5">
        <h2 className="font-display text-sm uppercase tracking-wider text-muted-foreground">
          Personal baseline overview
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-2">Signal</th>
                <th className="py-2">Baseline mean</th>
                <th className="py-2">Normal band</th>
                <th className="py-2">Current z-score</th>
              </tr>
            </thead>
            <tbody>
              {SIGNALS.map((s) => {
                const b = baselines[s.key];
                const z = zScores[s.key];
                return (
                  <tr key={s.key} className="border-t border-border/60">
                    <td className="py-2.5">
                      <span aria-hidden>{s.icon}</span> {s.label}
                    </td>
                    <td className="py-2.5 tabular-nums">
                      {b.mean.toFixed(s.decimals)} {s.unit}
                    </td>
                    <td className="py-2.5 tabular-nums">
                      {b.lower.toFixed(s.decimals)}–{b.upper.toFixed(s.decimals)} {s.unit}
                    </td>
                    <td
                      className={`py-2.5 tabular-nums ${Math.abs(z) >= config.threshold ? "text-alert" : "text-normal"}`}
                    >
                      {z.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
