"use client";

import { cn } from "@/lib/utils";
import { sectionAccent } from "../systemEditor/sectionAccent";

export interface NavItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  variant?: "default" | "success" | "warning";
}

interface SystemSidebarProps {
  items: NavItem[];
  activeId: string;
  onNavigate: (id: string) => void;
}

export function SystemSidebar({ items, activeId, onNavigate }: SystemSidebarProps) {
  return (
    <nav className="sticky top-6 flex flex-col gap-1.5">
      {items.map((item, _index) => {
        const isActive = activeId === item.id;
        const accent = sectionAccent(item.id);

        return (
          <button
            type="button"
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={cn(
              "group relative flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm font-medium transition-all",
              isActive ? cn(accent.navActive, "shadow-sm") : cn(accent.navIdle),
            )}
          >
            {isActive && <div className={cn("absolute left-0 top-0 h-full w-1 rounded-r-full", accent.bar)} />}

            <div className="flex flex-1 items-center gap-3">
              {item.icon && (
                <div className={cn("transition-all", isActive ? "scale-110" : "scale-100 group-hover:scale-105")}>
                  {item.icon}
                </div>
              )}
              <span className="truncate">{item.label}</span>
            </div>

            {item.badge !== undefined && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
                  isActive
                    ? "bg-white/80 text-zinc-900 dark:bg-zinc-900/80 dark:text-zinc-50"
                    : item.variant === "success"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                      : item.variant === "warning"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                        : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
                )}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
