import { useEffect, useRef, useState } from "react";
import type { HealthAlert } from "@/lib/compute";
import type { SignalKey } from "@/lib/signals";

/**
 * Manages the fullscreen multi-signal alert state.
 *
 * Condition-based behavior:
 * - Automatically OPENS when a multi-signal deviation occurs (>= 2 signals deviating).
 * - STAYS OPEN as long as deviation persists ("jotokhon DEVIATION thakbe toto khon thakbe").
 * - AUTOMATICALLY CLOSES when vitals normalize and deviation ends ("then auto close hobe").
 * - Manual dismissal is respected during the current episode and resets when vitals normalize.
 */
export function useMultiSignalAlert(
  alerts: HealthAlert[],
  deviatingNow: SignalKey[] = []
) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeAlert, setActiveAlert] = useState<HealthAlert | null>(null);
  const userDismissedRef = useRef(false);

  // Find the latest MULTI_SIGNAL_48H alert in the current timeline
  const latestMulti = alerts.find((a) => a.rule === "MULTI_SIGNAL_48H") ?? null;

  // Active deviation states:
  const hasMultiDeviation = deviatingNow.length >= 2;
  const hasAnyDeviation = deviatingNow.length > 0;

  useEffect(() => {
    // 1. Condition: Deviation has ended (all vitals returned to baseline)
    if (!hasAnyDeviation) {
      if (isOpen) {
        setIsOpen(false);
        setActiveAlert(null);
      }
      // Reset user dismissal state so that the next anomaly episode triggers normally
      userDismissedRef.current = false;
      return;
    }

    // 2. Condition: Multi-signal deviation detected (>= 2 signals deviating)
    if (hasMultiDeviation) {
      const alertCandidate = latestMulti ?? {
        alert_id: "ALT-MULTI-ACTIVE",
        timestamp: Date.now(),
        crew_id: "CREW-01",
        rule: "MULTI_SIGNAL_48H",
        status: "MULTI-SIGNAL",
        signals: deviatingNow.map((sig) => ({
          signal: sig,
          value: 0,
          baseline_mean: 0,
          baseline_std: 1,
          z_score: 3.2,
        })),
        threshold: 3.0,
        simulated: true,
      } as HealthAlert;

      // Automatically open if not previously dismissed by user during this episode
      if (!userDismissedRef.current && !isOpen) {
        setActiveAlert(alertCandidate);
        setIsOpen(true);
      }
    }

    // 3. Keep activeAlert synchronized if open and a newer multi-signal alert exists
    if (latestMulti && isOpen) {
      setActiveAlert(latestMulti);
    }
  }, [hasMultiDeviation, hasAnyDeviation, latestMulti, isOpen, deviatingNow]);

  const dismiss = () => {
    userDismissedRef.current = true;
    setIsOpen(false);
  };

  const manualOpen = () => {
    userDismissedRef.current = false;
    if (latestMulti) {
      setActiveAlert(latestMulti);
      setIsOpen(true);
    } else if (hasAnyDeviation) {
      setActiveAlert({
        alert_id: "ALT-MULTI-ACTIVE",
        timestamp: Date.now(),
        crew_id: "CREW-01",
        rule: "MULTI_SIGNAL_48H",
        status: "MULTI-SIGNAL",
        signals: deviatingNow.map((sig) => ({
          signal: sig,
          value: 0,
          baseline_mean: 0,
          baseline_std: 1,
          z_score: 3.2,
        })),
        threshold: 3.0,
        simulated: true,
      } as HealthAlert);
      setIsOpen(true);
    }
  };

  return {
    isOpen,
    activeAlert,
    dismiss,
    manualOpen,
    hasDeviation: hasAnyDeviation,
  };
}

