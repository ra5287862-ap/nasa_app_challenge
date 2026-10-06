import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { VitalCard } from "@/components/VitalCard";
import { SignalChart } from "@/components/SignalChart";
import { AlertCard } from "@/components/AlertCard";
import { ReplayControls } from "@/components/ReplayControls";
import { MultiSignalAlert } from "@/components/MultiSignalAlert";
import { useMultiSignalAlert } from "@/hooks/useMultiSignalAlert";
import { useMission } from "@/lib/mission-store";
import { crewSummary } from "@/lib/compute";
import { SIGNALS, type SignalKey } from "@/lib/signals";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Crew Health Console — Mission AURORA-01 Dashboard" },
      {
        name: "description",
        content:
          "Live simulated crew telemetry compared against personal baselines, with transparent deviation alerts for long-duration space missions.",
      },
      { property: "og:title", content: "Crew Health Console — Dashboard" },
      {
        property: "og:description",
        content:
          "Six monitored signals, personal baselines and multi-signal deviation alerts for mission crews.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const {
    current,
    history,
    baselines,
    zScores,
    deviatingNow,
    alerts,
    config,
    connection,
  } = useMission();
  const [focus, setFocus] = useState<SignalKey>("heart_rate");

  // ------------------------------------------------------------------ //
  // Multi-signal fullscreen state — condition-based trigger: opens     //
  // when multi-signal deviation occurs, stays open while deviation    //
  // persists, and automatically closes when vitals return to baseline. //
  // ------------------------------------------------------------------ //
  const { isOpen: alertOpen, activeAlert, dismiss, manualOpen } = useMultiSignalAlert(
    alerts,
    deviatingNow
  );

  // Compute the set of signals involved in the latest MULTI_SIGNAL alert
  const latestMulti = alerts.find((a) => a.rule === "MULTI_SIGNAL_48H") ?? null;
  const multiSignalKeys = new Set<SignalKey>(
    latestMulti?.signals.map((s) => s.signal as SignalKey) ?? [],
  );

  const recentMulti = alerts.some(
    (a) =>
      a.rule === "MULTI_SIGNAL_48H" &&
      current !== null &&
      current.timestamp - a.timestamp <= 48 * 3600 * 1000,
  );

  return (
    <AppShell
      title="🚀 Crew Health Monitoring Console"
      subtitle="Astronaut Alex • Mars Transit (Deep Space) • Personal Baseline Telemetry"
    >
      {/* FullScreen Multi-Signal Alert Overlay */}
      {alertOpen && activeAlert && (
        <MultiSignalAlert
          alert={activeAlert}
          onDismiss={dismiss}
          deviatingNow={deviatingNow}
          current={current}
          baselines={baselines}
          zScores={zScores}
        />
      )}

      {connection !== "connected" && (
        <div className="mb-4 rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning">
          ⚠ Replay paused — telemetry stream is idle.
        </div>
      )}

      <div className="mb-6 flex flex-col gap-3">
        <ReplayControls />

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/30 px-3.5 py-2 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 text-foreground font-medium">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              OSDR Metadata Cache v1.0.0
            </span>
            <span className="text-border">|</span>
            <span>Fixture: <strong className="text-foreground">demo_fixtures/vitals.json (600s @ 1Hz)</strong></span>
            <span className="text-border">|</span>
            <span>Seed: <strong className="text-foreground">42</strong> (Deterministic)</span>
          </div>

          <div className="flex items-center gap-2">
            <span>Detection: <strong className="text-primary">Personal Baseline (z ≥ {config.threshold.toFixed(1)}σ)</strong></span>
            <span className="text-border">|</span>
            <span className="text-warning">Planted Anomaly: <strong>07:30 (Idx 450)</strong></span>
          </div>
        </div>
      </div>

      {!current ? (
        <p className="text-sm text-muted-foreground">No telemetry available.</p>
      ) : (
        <>
          {/* ---------------------------------------------------------------- */}
          {/* Vital Cards — each shows NORMAL / DEVIATION / MULTI-SIGNAL badge */}
          {/* ---------------------------------------------------------------- */}
          <section
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
            aria-label="Current vital signs"
          >
            {SIGNALS.map((s) => (
              <VitalCard
                key={s.key}
                signal={s.key}
                value={current[s.key] as number}
                baseline={baselines[s.key]}
                z={zScores[s.key]}
                threshold={config.threshold}
                history={history}
                isMultiSignal={deviatingNow.length >= 2 && deviatingNow.includes(s.key)}
              />
            ))}
          </section>

          <section className="glass-panel mt-6 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-sm uppercase tracking-wider text-muted-foreground">
                Live health signals
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {SIGNALS.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setFocus(s.key)}
                    aria-pressed={focus === s.key}
                    className={`rounded-lg border px-2.5 py-1 text-xs transition-colors ${
                      focus === s.key
                        ? "border-primary/50 bg-primary/15 text-primary"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {s.short}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <SignalChart
                signal={focus}
                history={history}
                baseline={baselines[focus]}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Shaded band = personal baseline range (mean ± {config.threshold}σ), drawn
              behind the live signal.
            </p>
          </section>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <section className="glass-panel p-5 lg:col-span-2">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-sm uppercase tracking-wider text-muted-foreground">
                  Alerts
                </h2>
                <Link to="/alerts" className="text-xs text-primary hover:underline">
                  View all
                </Link>
              </div>

              {/* Re-open multi-signal panel shortcut when it was dismissed */}
              {latestMulti && !alertOpen && (
                <button
                  onClick={manualOpen}
                  className="mt-3 w-full rounded-lg border border-alert/40 bg-alert/10 px-3 py-2 text-left text-xs text-alert hover:bg-alert/15 transition-colors"
                  id="reopen-multisignal-btn"
                >
                  ⚡ Multi-signal alert detected —{" "}
                  <span className="underline">
                    View fullscreen panel
                  </span>
                </button>
              )}

              <div className="mt-4 space-y-4">
                {alerts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No active alerts.</p>
                ) : (
                  alerts.slice(0, 2).map((a) => <AlertCard key={a.alert_id} alert={a} />)
                )}
              </div>
            </section>

            <section className="glass-panel p-5">
              <h2 className="font-display text-sm uppercase tracking-wider text-muted-foreground">
                Crew summary
              </h2>
              <p className="mt-3 text-sm leading-relaxed">
                {crewSummary(deviatingNow, recentMulti)}
              </p>
              <p className="mt-4 text-xs text-muted-foreground">
                Statistical monitoring only. No medical diagnosis or treatment advice is
                provided.
              </p>
            </section>
          </div>
        </>
      )}
    </AppShell>
  );
}
