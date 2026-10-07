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
    { label: "Astronaut", value: "Alex" },
    { label: "Assignment", value: "Mars Transit Mission Specialist" },
    { label: "Clinical Facility", value: "Months away from Earth" },
    { label: "Baseline Model", value: "Personal Longitudinal" },
    { label: "Telemetry Mode", value: "🟢 SIMULATED TELEMETRY" },
  ];

  return (
    <AppShell title="Crew Profile — Astronaut Alex">
      {/* Story Narrative Box */}
      <div className="mb-6 rounded-xl border border-cyan-500/30 bg-[#08131B]/30 p-4.5 text-[#E5EEF2] shadow-[0_4px_20px_-4px_rgba(5,10,15,0.4)] backdrop-blur-md">
        <h3 className="text-sm font-mono font-bold text-cyan-300 glow-cyan-text flex items-center gap-2">
          <span>🧑‍🚀</span> INDIVIDUALIZED SPACEFLIGHT MONITORING PHILOSOPHY
        </h3>
        <p className="mt-1.5 text-xs text-[#7F98A3] leading-relaxed font-sans">
          Alex is millions of kilometers from Earth, months away from any hospital or clinical team.
          Every astronaut has unique physiological setpoints: for example, Alex’s normal resting HRV is
          <strong className="text-[#E5EEF2]"> ~48 ms</strong>, whereas another crew member’s might naturally sit at <strong className="text-[#E5EEF2]">30–35 ms</strong>.
          The console never compares Alex to other astronauts — detection is strictly individualized to Alex's personal baseline.
        </p>
      </div>

      <section className="bg-[#08131B]/25 border border-cyan-500/20 rounded-xl p-5 shadow-[0_4px_24px_-4px_rgba(5,10,15,0.4)] backdrop-blur-md grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {facts.map((f) => (
          <div key={f.label} className="rounded-lg bg-[#040A10]/30 border border-cyan-500/15 p-3 backdrop-blur-sm">
            <p className="text-xs uppercase font-mono tracking-wider text-[#7F98A3]">
              {f.label}
            </p>
            <p className="mt-1 font-mono text-sm font-bold text-[#E5EEF2]">{f.value}</p>
          </div>
        ))}
      </section>

      <section className="bg-[#08131B]/25 border border-cyan-500/20 rounded-xl p-5 shadow-[0_4px_24px_-4px_rgba(5,10,15,0.4)] backdrop-blur-md mt-6 overflow-hidden">
        <h2 className="font-mono text-sm uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-2">
          <span>📊</span> Alex's Personal baseline overview
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase font-mono tracking-wider text-[#7F98A3] border-b border-cyan-500/20">
                <th className="py-2.5">Signal</th>
                <th className="py-2.5">Baseline mean</th>
                <th className="py-2.5">Normal band</th>
                <th className="py-2.5">Current z-score</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {SIGNALS.map((s) => {
                const b = baselines[s.key];
                const z = zScores[s.key];
                const isAlert = Math.abs(z) >= config.threshold;
                return (
                  <tr key={s.key} className="border-t border-cyan-500/10 hover:bg-cyan-500/5 transition-colors">
                    <td className="py-2.5 text-[#E5EEF2]">
                      <span aria-hidden className="mr-1.5">{s.icon}</span> {s.label}
                    </td>
                    <td className="py-2.5 tabular-nums text-cyan-300">
                      {b.mean.toFixed(s.decimals)} {s.unit}
                    </td>
                    <td className="py-2.5 tabular-nums text-[#7F98A3]">
                      {b.lower.toFixed(s.decimals)}–{b.upper.toFixed(s.decimals)} {s.unit}
                    </td>
                    <td
                      className={`py-2.5 tabular-nums font-bold ${isAlert ? "text-red-400 glow-alert-text" : "text-emerald-400"}`}
                    >
                      {z.toFixed(2)}σ
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
