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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/10 p-4 text-xs">
        <div className="flex items-center gap-2.5">
          <Database className="size-4 text-primary" />
          <div>
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <span>Reproducible OSDR Cache</span>
              <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-mono text-primary">
                v{OSDR_CACHE_VERSION}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Decoupled architecture: Cached metadata stored in{" "}
              <code className="font-mono text-primary/80">data/osdr/studies/</code> to avoid
              runtime dependency on external API calls.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="size-3.5 text-emerald-400" />
            <span>Source: <strong className="text-foreground">{OSDR_CACHE_SOURCE}</strong></span>
          </div>
          <div>
            Total Cached Studies: <strong className="text-foreground">{OSDR_STUDIES.length}</strong>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <label className="relative block w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search studies by title, keyword, organism..."
            className="w-full rounded-lg border border-input bg-panel pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
        <span className="text-xs text-muted-foreground">
          Showing {results.length} of {OSDR_STUDIES.length} studies
        </span>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {results.length === 0 ? (
          <p className="text-sm text-muted-foreground">No studies match this search.</p>
        ) : (
          results.map((s) => (
            <article key={s.id} className="glass-panel flex flex-col justify-between p-5">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-primary">{s.id}</span>
                  <span className="rounded-full bg-secondary/80 px-2 py-0.5 text-[10px] text-muted-foreground">
                    {s.mission || "NASA Spaceflight"}
                  </span>
                </div>
                <h2 className="mt-2 font-display text-base font-semibold">{s.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {s.description}
                </p>

                {s.factors && s.factors.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {s.factors.map((f) => (
                      <span
                        key={f}
                        className="rounded border border-border/60 bg-background/50 px-2 py-0.5 text-[10px] text-muted-foreground"
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
