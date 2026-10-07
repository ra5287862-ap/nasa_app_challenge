import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ExternalLink, Database, CheckCircle2, Search } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { OSDR_STUDIES, OSDR_CACHE_VERSION, OSDR_CACHE_SOURCE } from "@/lib/osdr";
import { SIGNAL_BY_KEY } from "@/lib/signals";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "NASA OSDR Research — Crew Health Console" },
      {
        name: "description",
        content:
          "Searchable NASA Open Science Data Repository study references linked to the monitored crew health signals.",
      },
      { property: "og:title", content: "NASA OSDR Research References" },
      {
        property: "og:description",
        content: "Spaceflight health studies mapped to heart rate, HRV, SpO2, sleep, temperature and exercise.",
      },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  const [query, setQuery] = useState("");
  const results = OSDR_STUDIES.filter((s) =>
    `${s.id} ${s.title} ${s.description} ${s.organism || ""} ${s.mission || ""}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  return (
    <AppShell title="NASA OSDR Research" subtitle="Open Science Data Repository Verified Cache">
      {/* Cache architecture banner */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-cyan-500/30 bg-[#08131B]/30 p-4 text-xs font-mono shadow-[0_4px_20px_-4px_rgba(5,10,15,0.7)] backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <Database className="size-4 text-cyan-400" />
          <div>
            <div className="flex items-center gap-1.5 font-semibold text-[#E5EEF2]">
              <span>Reproducible OSDR Cache</span>
              <span className="rounded bg-cyan-400/20 px-1.5 py-0.5 text-[10px] text-cyan-300">
                v{OSDR_CACHE_VERSION}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-[#7F98A3] font-sans">
              Decoupled architecture: Cached metadata stored in{" "}
              <code className="font-mono text-cyan-300">data/osdr/studies/</code> to avoid
              runtime dependency on external API calls.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[#7F98A3]">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="size-3.5 text-emerald-400" />
            <span>Source: <strong className="text-[#E5EEF2]">{OSDR_CACHE_SOURCE}</strong></span>
          </div>
          <div>
            Total Cached Studies: <strong className="text-cyan-300">{OSDR_STUDIES.length}</strong>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <label className="relative block w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#7F98A3]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search studies by title, keyword, organism..."
            className="w-full rounded-lg border border-cyan-500/25 bg-[#040A10]/40 pl-9 pr-3 py-2 text-sm font-mono text-[#E5EEF2] placeholder-[#7F98A3] outline-none backdrop-blur-md focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
          />
        </label>
        <span className="text-xs font-mono text-[#7F98A3]">
          Showing {results.length} of {OSDR_STUDIES.length} studies
        </span>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {results.length === 0 ? (
          <p className="text-sm font-mono text-[#7F98A3]">No studies match this search.</p>
        ) : (
          results.map((s) => (
            <article key={s.id} className="bg-[#08131B]/25 border border-cyan-500/20 rounded-xl flex flex-col justify-between p-5 shadow-[0_4px_20px_-4px_rgba(5,10,15,0.7)] backdrop-blur-md transition-all hover:border-cyan-400/40 hover:bg-[#08131B]/40">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-cyan-400">{s.id}</span>
                  <span className="rounded-full bg-[#0B1821]/40 border border-cyan-500/20 px-2 py-0.5 text-[10px] font-mono text-[#7F98A3]">
                    {s.mission || "NASA Spaceflight"}
                  </span>
                </div>
                <h2 className="mt-2 font-display text-base font-semibold text-[#E5EEF2]">{s.title}</h2>
                <p className="mt-2 text-xs text-[#7F98A3] leading-relaxed">
                  {s.description}
                </p>

                {s.factors && s.factors.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {s.factors.map((f) => (
                      <span
                        key={f}
                        className="rounded border border-cyan-500/20 bg-[#040A10]/50 px-2 py-0.5 text-[10px] font-mono text-[#7F98A3]"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-border/50 flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs text-muted-foreground">
                  Linked signals:{" "}
                  <strong className="text-foreground">
                    {s.signals.map((k) => SIGNAL_BY_KEY[k].short).join(", ")}
                  </strong>
                </div>

                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                >
                  OSDR Record <ExternalLink className="size-3" aria-hidden />
                </a>
              </div>
            </article>
          ))
        )}
      </div>
    </AppShell>
  );
}
