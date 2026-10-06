import { useEffect } from "react";
import { X, AlertTriangle, Layers, Activity, Radio } from "lucide-react";
import type { Baseline, HealthAlert, VitalSample } from "@/lib/compute";
import { SIGNAL_BY_KEY, type SignalKey } from "@/lib/signals";
import { formatDateUtc, missionDay } from "@/lib/compute";

interface MultiSignalAlertProps {
  alert: HealthAlert;
  onDismiss: () => void;
  deviatingNow?: SignalKey[];
  current?: VitalSample | null;
  baselines?: Record<SignalKey, Baseline>;
  zScores?: Record<SignalKey, number>;
}

export function MultiSignalAlert({
  alert,
  onDismiss,
  deviatingNow = [],
  current,
  baselines,
  zScores,
}: MultiSignalAlertProps) {
  // Close on Escape key — accessibility requirement
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onDismiss]);

  // Prevent background scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const currentTimestamp = current?.timestamp ?? alert.timestamp;

  return (
    /* Backdrop */
    <div
      className="fullscreen-alert-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Multi-Signal Health Alert"
      onClick={(e) => {
        if (e.target === e.currentTarget) onDismiss();
      }}
    >
      {/* Panel */}
      <div className="fullscreen-alert-panel">
        {/* Header */}
        <header className="fullscreen-alert-header">
          <div className="fullscreen-alert-header-left">
            <span className="fullscreen-alert-icon-wrap">
              <Layers className="size-5" aria-hidden />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="fullscreen-alert-title">MULTI-SIGNAL ALERT</h2>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-alert/40 bg-alert/20 px-2 py-0.5 text-[11px] font-semibold tracking-wider text-alert uppercase">
                  <span className="size-1.5 rounded-full bg-alert animate-ping" />
                  Active Deviation
                </span>
              </div>
              <p className="fullscreen-alert-subtitle">
                Day {missionDay(currentTimestamp)} · {formatDateUtc(currentTimestamp)}{" "}
                <span className="text-primary font-medium">• Astronaut Alex</span>{" "}
                <span className="text-warning/90 font-medium">• Auto-closes upon normalization</span>
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            aria-label="Dismiss alert"
            className="fullscreen-alert-close"
          >
            <X className="size-5" aria-hidden />
          </button>
        </header>

        {/* Description */}
        <div className="fullscreen-alert-desc flex items-center justify-between gap-3">
          <p className="flex items-center">
            <AlertTriangle className="inline size-4 mr-1.5 text-alert shrink-0" aria-hidden />
            <span>
              {alert.signals.length} health signals deviated from Alex&apos;s personal baseline —
              monitoring continuously until recovery. Nothing is diagnosed; everything is evidenced.
            </span>
          </p>
          <span className="hidden sm:inline-flex items-center gap-1 rounded bg-muted/60 px-2 py-0.5 text-xs text-muted-foreground whitespace-nowrap">
            <Radio className="size-3 text-emerald-400 animate-pulse" />
            Live Stream
          </span>
        </div>

        {/* Signals grid */}
        <div className="fullscreen-alert-signals">
          {alert.signals.map((s) => {
            const meta = SIGNAL_BY_KEY[s.signal];
            if (!meta) return null;

            // Use live values when available, fallback to snapshot
            const liveValue = current && typeof current[s.signal] === "number"
              ? (current[s.signal] as number)
              : s.value;

            const liveBaseline = baselines ? baselines[s.signal] : null;
            const liveMean = liveBaseline ? liveBaseline.mean : s.baseline_mean;
            const liveZ = zScores && typeof zScores[s.signal] === "number"
              ? zScores[s.signal]
              : s.z_score;

            const isCurrentlyDeviating = deviatingNow.length > 0
              ? deviatingNow.includes(s.signal)
              : Math.abs(liveZ) >= (alert.threshold || 3.0);

            const aboveBaseline = liveValue > liveMean;

            return (
              <div
                key={s.signal}
                className={`fullscreen-signal-card transition-all duration-300 ${
                  !isCurrentlyDeviating
                    ? "border-emerald-500/30 bg-emerald-950/15"
                    : ""
                }`}
              >
                <div className="fullscreen-signal-header">
                  <span className="fullscreen-signal-icon">{meta.icon}</span>
                  <span className="fullscreen-signal-label">{meta.label}</span>
                  <span
                    className={`fullscreen-signal-badge ${
                      !isCurrentlyDeviating
                        ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
                        : ""
                    }`}
                  >
                    {isCurrentlyDeviating ? "DEVIATION" : "NORMALIZED"}
                  </span>
                </div>

                <p className="fullscreen-signal-value">
                  {liveValue.toFixed(meta.decimals)}
                  <span className="fullscreen-signal-unit">{meta.unit}</span>
                </p>

                <div className="fullscreen-signal-baseline-row">
                  <Activity className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                  <span>
                    Baseline {liveMean.toFixed(meta.decimals)} {meta.unit}
                  </span>
                  <span
                    className={
                      aboveBaseline
                        ? "fullscreen-signal-direction-up"
                        : "fullscreen-signal-direction-down"
                    }
                  >
                    {aboveBaseline ? "▲" : "▼"}{" "}
                    {aboveBaseline ? "Above" : "Below"} baseline
                  </span>
                </div>

                <div className="fullscreen-signal-zscore-bar-wrap">
                  <div className="flex items-center justify-between text-xs">
                    <span className="fullscreen-signal-zscore-label">
                      z-score {liveZ.toFixed(2)}σ
                    </span>
                    {!isCurrentlyDeviating && (
                      <span className="text-[11px] text-emerald-400 font-medium">
                        Within baseline
                      </span>
                    )}
                  </div>
                  <div className="fullscreen-signal-zscore-track">
                    <div
                      className="fullscreen-signal-zscore-fill transition-all duration-300"
                      style={{
                        width: `${Math.min(100, (Math.abs(liveZ) / 6) * 100)}%`,
                        backgroundColor: !isCurrentlyDeviating ? "rgb(52 211 153)" : undefined,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <footer className="fullscreen-alert-footer">
          <p className="fullscreen-alert-disclaimer">
            Continuous anomaly monitoring. This panel will automatically close once vital
            signs return within baseline thresholds (±{alert.threshold.toFixed(1)}σ).
          </p>
          <div className="fullscreen-alert-actions">
            <button
              onClick={onDismiss}
              className="fullscreen-alert-btn-dismiss"
              id="multi-signal-dismiss-btn"
            >
              <X className="size-4" aria-hidden />
              Dismiss
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

