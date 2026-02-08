"use client";

import { HelpCircle } from "lucide-react";
import { type ReactNode, useState } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  content: string;
  children?: ReactNode;
  icon?: boolean;
}

export function Tooltip({ content, children, icon = false }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [tooltipRef, setTooltipRef] = useState<HTMLSpanElement | null>(null);

  const handleMouseEnter = (e: React.MouseEvent<HTMLSpanElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({
      top: rect.top - 8, // 8px above the element
      left: rect.left + rect.width / 2, // centered horizontally
    });
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <>
      <span
        ref={setTooltipRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative inline-flex items-center cursor-help"
      >
        {children || (
          <HelpCircle className="h-4 w-4 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300" />
        )}
      </span>

      {isVisible &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            className="fixed z-[9999] pointer-events-none"
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
              transform: "translate(-50%, -100%)",
            }}
          >
            <div className="w-64 rounded-md bg-zinc-900 dark:bg-zinc-100 px-3 py-2 text-xs text-zinc-50 dark:text-zinc-900 shadow-xl border border-zinc-700 dark:border-zinc-300 mb-2">
              {content}
              <div className="absolute left-1/2 top-full -translate-x-1/2 -mt-px border-4 border-transparent border-t-zinc-900 dark:border-t-zinc-100"></div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
