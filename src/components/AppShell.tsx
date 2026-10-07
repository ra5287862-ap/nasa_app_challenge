import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  Activity,
  BellRing,
  CalendarClock,
  Gauge,
  Menu,
  Rocket,
  Settings,
  UserRound,
  BookOpen,
  X,
} from "lucide-react";
import { useMission, MISSION_NAME, CREW_ID } from "@/lib/mission-store";
import { missionDay } from "@/lib/compute";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: Gauge },
  { to: "/crew", label: "Crew Profile", icon: UserRound },
  { to: "/signals", label: "Live Signals", icon: Activity },
  { to: "/alerts", label: "Alerts", icon: BellRing },
  { to: "/timeline", label: "Timeline", icon: CalendarClock },
  { to: "/research", label: "Research", icon: BookOpen },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function SimulatedBadge() {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border border-emerald-500/50 bg-emerald-500/15 px-3 py-1 text-xs font-mono font-bold tracking-wider text-emerald-400 shadow-[0_0_12px_rgba(34,197,94,0.25)]"
      aria-label="Simulated Telemetry. Not real medical measurements."
    >
      <span className="size-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden />
      🟢 SIMULATED TELEMETRY
    </span>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { alerts, connection } = useMission();
  return (
    <div className="flex h-full flex-col gap-6 p-5 bg-[#08131B]/75 backdrop-blur-xl text-[#E5EEF2]">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl border border-cyan-400/40 bg-cyan-400/15 text-cyan-400 shadow-[0_0_16px_rgba(34,211,238,0.25)]">
          <Rocket className="size-5" aria-hidden />
        </span>
        <div>
          <p className="font-display text-sm font-bold tracking-wider text-cyan-300 glow-cyan-text">ASTRO MED</p>
          <p className="text-xs font-mono text-[#7F98A3]">{MISSION_NAME}</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1.5" aria-label="Main navigation">
        {NAV.map(({ to, label, icon: Icon }) => {
          const active = pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-mono transition-all ${
                active
                  ? "border border-cyan-400/35 bg-cyan-400/15 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.15)] font-semibold"
                  : "text-[#7F98A3] hover:bg-[#0B1821]/40 hover:text-[#E5EEF2]"
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon className="size-4" aria-hidden />
                {label}
              </span>
              {to === "/alerts" && alerts.length > 0 && (
                <span className="rounded-full bg-red-500/20 border border-red-500/40 px-2 py-0.5 text-[11px] font-bold text-red-400">
                  {alerts.length}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 rounded-xl border border-cyan-500/20 bg-[#040A10]/40 backdrop-blur-md p-3 text-xs font-mono">
        <p className="flex items-center gap-2">
          <span
            className={`status-dot ${connection === "connected" ? "bg-emerald-400 text-emerald-400" : "bg-amber-400 text-amber-400"}`}
            aria-hidden
          />
          <span className="text-[#E5EEF2]">{connection === "connected" ? "System Online" : "Reconnecting…"}</span>
        </p>
        <p className="text-amber-400">SIMULATED MODE</p>
      </div>
    </div>
  );
}

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { current } = useMission();
  const day = current ? missionDay(current.timestamp) : 1;

  return (
    <div className="relative z-10 min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-cyan-500/20 bg-[#08131B]/75 backdrop-blur-xl lg:block">
        <SidebarContent />
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-[#050A0F]/70 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 border-r border-cyan-500/20 bg-[#08131B]/90 backdrop-blur-xl">
            <div className="flex justify-end p-3">
              <button
                onClick={() => setOpen(false)}
                aria-label="Close navigation"
                className="rounded-md p-2 text-[#7F98A3] hover:text-[#E5EEF2]"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-cyan-500/20 bg-[#050A0F]/65 backdrop-blur-xl">
          <div className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
            <button
              onClick={() => setOpen(true)}
              aria-label="Open navigation"
              className="rounded-md p-2 text-[#7F98A3] hover:text-[#E5EEF2] lg:hidden"
            >
              <Menu className="size-5" aria-hidden />
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate font-display text-base font-semibold sm:text-lg text-[#E5EEF2]">
                  {title}
                </h1>
                <span className="hidden md:inline-flex items-center rounded-md border border-cyan-400/40 bg-cyan-400/10 px-2 py-0.5 text-[11px] font-mono text-cyan-300">
                  Astronaut Alex • Mars Transit
                </span>
              </div>
              <p className="truncate text-xs font-mono text-[#7F98A3]">
                {subtitle ?? `Mission ${MISSION_NAME} · Crew ${CREW_ID} · Mission day ${day}`}
              </p>
            </div>
            <SimulatedBadge />
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6">{children}</main>
        <footer className="px-4 pb-10 text-xs text-muted-foreground sm:px-6">
          <div className="flex flex-col gap-1 border-t border-border/40 pt-4">
            <p className="font-medium text-foreground/80">
              ⚡ Core Philosophy: Nothing is diagnosed; everything is evidenced.
            </p>
            <p>
              Detection is deterministic code in Python (<code className="text-primary font-mono text-[11px]">src/compute/detect.py</code>).
              AI is strictly constrained to evidence citation from peer-reviewed databases (NASA OSDR / GeneLab / NTRS).
              No medical diagnosis or clinical treatments provided.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
