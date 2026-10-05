import { useEffect, useRef, useState } from "react";
import type { HealthAlert } from "@/lib/compute";

/**
 * Manages the fullscreen multi-signal alert state.
 *
 * - Auto-triggers when a NEW multi-signal alert is detected.
 * - Re-trigger protection: the same alert_id never opens the panel twice.
 * - Provides a dismiss callback that closes the panel.
 */
export function useMultiSignalAlert(alerts: HealthAlert[]) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeAlert, setActiveAlert] = useState<HealthAlert | null>(null);
  const lastHandledId = useRef<string | null>(null);

  // Find the most-recent MULTI_SIGNAL_48H alert
  const latestMulti = alerts.find((a) => a.rule === "MULTI_SIGNAL_48H") ?? null;

  useEffect(() => {
    if (
      latestMulti &&
      latestMulti.alert_id !== lastHandledId.current
    ) {
      lastHandledId.current = latestMulti.alert_id;
      setActiveAlert(latestMulti);
      setIsOpen(true);
    }
  }, [latestMulti]);

  // When alerts clear (e.g., replay resets), close panel
  useEffect(() => {
    if (!latestMulti && isOpen) {
      setIsOpen(false);
      setActiveAlert(null);
    }
  }, [latestMulti, isOpen]);

  const dismiss = () => {
    setIsOpen(false);
  };

  const manualOpen = () => {
    if (latestMulti) {
      setActiveAlert(latestMulti);
      setIsOpen(true);
    }
  };

  return { isOpen, activeAlert, dismiss, manualOpen };
}
