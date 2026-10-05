import { useEffect } from "react";
import { X, AlertTriangle, Layers, Activity } from "lucide-react";
import type { HealthAlert } from "@/lib/compute";
import { SIGNAL_BY_KEY } from "@/lib/signals";
import { formatDateUtc, missionDay } from "@/lib/compute";

interface MultiSignalAlertProps {
  alert: HealthAlert;
  onDismiss: () => void;
}

export function MultiSignalAlert({ alert, onDismiss }: MultiSignalAlertProps) {
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
              <h2 className="fullscreen-alert-title">MULTI-SIGNAL ALERT</h2>
              <p className="fullscreen-alert-subtitle">
                Day {missionDay(alert.timestamp)} ·{" "}
                {formatDateUtc(alert.timestamp)}
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
        <p className="fullscreen-alert-desc">
          <AlertTriangle className="inline size-4 mr-1.5 text-alert" aria-hidden />
          {alert.signals.length} health signals are simultaneously deviating
          from their personal baselines — immediate review recommended.
        </p>

        {/* Signals grid */}
        <div className="fullscreen-alert-signals">
          {alert.signals.map((s) => {
            const meta = SIGNAL_BY_KEY[s.signal];
            const aboveBaseline = s.value > s.baseline_mean;
            return (
              <div key={s.signal} className="fullscreen-signal-card">
                <div className="fullscreen-signal-header">
                  <span className="fullscreen-signal-icon">{meta.icon}</span>
                  <span className="fullscreen-signal-label">{meta.label}</span>
                  <span className="fullscreen-signal-badge">
                    DEVIATION
                  </span>
                </div>

                <p className="fullscreen-signal-value">
                  {s.value.toFixed(meta.decimals)}
                  <span className="fullscreen-signal-unit">{meta.unit}</span>
                </p>

                <div className="fullscreen-signal-baseline-row">
                  <Activity className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                  <span>
                    Baseline {s.baseline_mean.toFixed(meta.decimals)} {meta.unit}
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
                  <span className="fullscreen-signal-zscore-label">
                    z-score {s.z_score.toFixed(2)}σ
                  </span>
                  <div className="fullscreen-signal-zscore-track">
                    <div
                      className="fullscreen-signal-zscore-fill"
                      style={{
                        width: `${Math.min(100, (Math.abs(s.z_score) / 6) * 100)}%`,
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
            Statistical monitoring only. This alert is based on personal
            baseline deviation and does not constitute medical diagnosis or
            treatment advice.
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
