"use client";

import { motion } from "framer-motion";
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
      {items.map((item, index) => {
        const isActive = activeId === item.id;
        const accent = sectionAccent(item.id);

        return (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onNavigate(item.id)}
            className={cn(
              "group relative flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm font-medium transition-all",
              isActive ? cn(accent.navActive, "shadow-sm") : cn(accent.navIdle),
            )}
          >
            {isActive && (
              <motion.div
                layoutId="sidebar-indicator"
                className={cn("absolute left-0 top-0 h-full w-1 rounded-r-full", accent.bar)}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}

            <div className="flex flex-1 items-center gap-3">
              {item.icon && (
                <div className={cn("transition-all", isActive ? "scale-110" : "scale-100 group-hover:scale-105")}>
                  {item.icon}
                </div>
              )}
              <span className="truncate">{item.label}</span>
            </div>

            {item.badge !== undefined && (
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
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
              </motion.span>
            )}
          </motion.button>
        );
      })}
    </nav>
  );
}
