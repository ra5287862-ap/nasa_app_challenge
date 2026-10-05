import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  Activity,
  BellRing,
  CalendarClock,
  Gauge,
  Home,
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
  { to: "/", label: "Home", icon: Home },
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
      className="inline-flex items-center gap-2 rounded-full border border-warning/40 bg-warning/10 px-3 py-1 text-xs font-medium tracking-wide text-warning"
      aria-label="Simulated data. Not real medical measurements."
    >
      <span className="status-dot bg-warning text-warning" aria-hidden />
      SIMULATED DATA
    </span>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { alerts, connection } = useMission();
  return (
    <div className="flex h-full flex-col gap-6 p-5">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-primary/15 text-primary glow-ring">
          <Rocket className="size-5" aria-hidden />
        </span>
        <div>
          <p className="font-display text-sm font-semibold">Mission Health</p>
          <p className="text-xs text-muted-foreground">{MISSION_NAME}</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1" aria-label="Main navigation">
        {NAV.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon className="size-4" aria-hidden />
                {label}
              </span>
              {to === "/alerts" && alerts.length > 0 && (
                <span className="rounded-full bg-alert/20 px-2 py-0.5 text-[11px] font-medium text-alert">
                  {alerts.length}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 rounded-xl border border-border/60 bg-panel/50 p-3 text-xs">
        <p className="flex items-center gap-2">
          <span
            className={`status-dot ${connection === "connected" ? "bg-normal text-normal" : "bg-warning text-warning"}`}
            aria-hidden
          />
          {connection === "connected" ? "System Online" : "Reconnecting…"}
        </p>
        <p className="text-warning">SIMULATED MODE</p>
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
    <div className="relative z-10 min-h-screen grid-lines">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border/60 bg-panel/60 backdrop-blur-xl lg:block">
        <SidebarContent />
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 border-r border-border/60 bg-panel">
            <div className="flex justify-end p-3">
              <button
                onClick={() => setOpen(false)}
                aria-label="Close navigation"
                className="rounded-md p-2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
          <div className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
            <button
              onClick={() => setOpen(true)}
              aria-label="Open navigation"
              className="rounded-md p-2 text-muted-foreground hover:text-foreground lg:hidden"
            >
              <Menu className="size-5" aria-hidden />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-display text-base font-semibold sm:text-lg">
                {title}
              </h1>
              <p className="truncate text-xs text-muted-foreground">
                {subtitle ?? `Mission ${MISSION_NAME} · Crew ${CREW_ID} · Mission day ${day}`}
              </p>
            </div>
            <SimulatedBadge />
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6">{children}</main>
        <footer className="px-4 pb-10 text-xs text-muted-foreground sm:px-6">
          Monitoring and explanation tool only. It reports deviations from personal
          baselines and does not provide medical diagnosis or treatment advice.
        </footer>
      </div>
    </div>
  );
}
