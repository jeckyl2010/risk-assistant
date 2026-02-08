"use client";

import { Command } from "cmdk";
import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, FileText, GitCompare, Home, Save, Search, Shield, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface CommandPaletteProps {
  systemId?: string;
  onSave?: () => void;
  onNavigate?: (section: string) => void;
  questionSections?: Array<{ key: string; title: string }>;
}

export function CommandPalette({ systemId: _systemId, onSave, onNavigate, questionSections = [] }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Toggle the command palette
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = useCallback((callback: () => void) => {
    callback();
    setOpen(false);
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Command Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="fixed left-1/2 top-[20%] z-50 w-full max-w-2xl -translate-x-1/2"
          >
            <Command className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-3 border-b border-zinc-200 px-4 dark:border-zinc-800">
                <Search className="h-5 w-5 text-zinc-500" />
                <Command.Input
                  placeholder="Type a command or search..."
                  className="flex h-14 w-full bg-transparent text-base text-zinc-900 placeholder:text-zinc-500 focus:outline-none dark:text-zinc-50"
                />
                <kbd className="hidden rounded bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 sm:inline-block">
                  ESC
                </kbd>
              </div>

              <Command.List className="max-h-96 overflow-y-auto p-2">
                <Command.Empty className="flex flex-col items-center justify-center gap-2 py-12 text-center text-sm text-zinc-500">
                  <Sparkles className="h-8 w-8 text-zinc-400" />
                  <p>No results found.</p>
                </Command.Empty>

                {/* Navigation */}
                <Command.Group heading="Navigation" className="text-xs font-medium text-zinc-500 px-3 py-2">
                  <Command.Item
                    onSelect={() => handleSelect(() => router.push("/"))}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 aria-selected:bg-indigo-500 aria-selected:text-white cursor-pointer"
                  >
                    <Home className="h-4 w-4" />
                    <span>Go to Portfolio</span>
                  </Command.Item>
                  {onNavigate && (
                    <>
                      <Command.Item
                        onSelect={() => handleSelect(() => onNavigate("description"))}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 aria-selected:bg-indigo-500 aria-selected:text-white cursor-pointer"
                      >
                        <FileText className="h-4 w-4" />
                        <span>Go to Overview</span>
                      </Command.Item>
                      <Command.Item
                        onSelect={() => handleSelect(() => onNavigate("results"))}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 aria-selected:bg-indigo-500 aria-selected:text-white cursor-pointer"
                      >
                        <BarChart3 className="h-4 w-4" />
                        <span>Go to Results</span>
                      </Command.Item>
                      <Command.Item
                        onSelect={() => handleSelect(() => onNavigate("diff"))}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 aria-selected:bg-indigo-500 aria-selected:text-white cursor-pointer"
                      >
                        <GitCompare className="h-4 w-4" />
                        <span>Go to Diff</span>
                      </Command.Item>
                    </>
                  )}
                </Command.Group>

                {/* Question Sections */}
                {questionSections.length > 0 && (
                  <Command.Group heading="Question Sections" className="text-xs font-medium text-zinc-500 px-3 py-2">
                    {questionSections.map((section) => (
                      <Command.Item
                        key={section.key}
                        onSelect={() => handleSelect(() => onNavigate?.(section.key))}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 aria-selected:bg-indigo-500 aria-selected:text-white cursor-pointer"
                      >
                        <Shield className="h-4 w-4" />
                        <span>{section.title}</span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                {/* Actions */}
                {onSave && (
                  <Command.Group heading="Actions" className="text-xs font-medium text-zinc-500 px-3 py-2">
                    <Command.Item
                      onSelect={() => handleSelect(onSave)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 aria-selected:bg-green-500 aria-selected:text-white cursor-pointer"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save System</span>
                      <kbd className="ml-auto rounded bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                        ⌘S
                      </kbd>
                    </Command.Item>
                  </Command.Group>
                )}
              </Command.List>

              {/* Footer */}
              <div className="border-t border-zinc-200 bg-zinc-50 px-4 py-2 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950">
                <div className="flex items-center justify-between">
                  <span>Press ⌘K to toggle command palette</span>
                  <div className="flex items-center gap-2">
                    <kbd className="rounded bg-white px-2 py-1 font-medium dark:bg-zinc-900">↑↓</kbd>
                    <span>Navigate</span>
                    <kbd className="rounded bg-white px-2 py-1 font-medium dark:bg-zinc-900">↵</kbd>
                    <span>Select</span>
                  </div>
                </div>
              </div>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
