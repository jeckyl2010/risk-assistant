"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronUp, FileText, Folder, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";

type BrowseItem = {
  name: string;
  path: string;
  isDirectory: boolean;
  isYaml: boolean;
};

type BrowseResponse = {
  currentPath: string;
  parent: string | null;
  items: BrowseItem[];
  error?: string;
};

type FileBrowserModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (path: string) => void;
  mode: "file" | "directory";
  title?: string;
};

export function FileBrowserModal({
  isOpen,
  onClose,
  onSelect,
  mode,
  title,
}: FileBrowserModalProps) {
  const [currentPath, setCurrentPath] = useState<string>("");
  const [parent, setParent] = useState<string | null>(null);
  const [items, setItems] = useState<BrowseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const fetchDirectory = async (path?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = path ? `/api/browse?path=${encodeURIComponent(path)}` : "/api/browse";

      const res = await fetch(url);
      const data: BrowseResponse = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to browse directory");
      }

      setCurrentPath(data.currentPath);
      setParent(data.parent);
      setItems(data.items);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load directory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDirectory();
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";

      // Close on ESC key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };

      document.addEventListener("keydown", handleEscape);

      return () => {
        document.body.style.overflow = "unset";
        document.removeEventListener("keydown", handleEscape);
      };
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleItemClick = (item: BrowseItem) => {
    if (item.isDirectory) {
      fetchDirectory(item.path);
    } else if (mode === "file" && item.isYaml) {
      onSelect(item.path);
      onClose();
    }
  };

  const handleSelectCurrentDirectory = () => {
    if (mode === "directory") {
      onSelect(currentPath);
      onClose();
    }
  };

  if (!isOpen) return null;
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-200 p-4 dark:border-zinc-800">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {title || (mode === "file" ? "Select System File" : "Select Directory")}
            </h3>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Current Path */}
          <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-2 dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Path:</span>
              <code className="flex-1 text-xs text-zinc-700 dark:text-zinc-300">{currentPath}</code>
              {parent && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchDirectory(parent)}
                  className="h-7 gap-1"
                >
                  <ChevronUp className="h-3 w-3" />
                  Up
                </Button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="max-h-96 min-h-[300px] overflow-y-auto p-2">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
              </div>
            ) : error ? (
              <div className="flex h-full items-center justify-center text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            ) : items.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                No folders or YAML files found
              </div>
            ) : (
              <div className="space-y-1">
                {items.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleItemClick(item)}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    {item.isDirectory ? (
                      <Folder className="h-4 w-4 text-blue-500" />
                    ) : (
                      <FileText className="h-4 w-4 text-indigo-500" />
                    )}
                    <span className="flex-1 text-sm text-zinc-700 dark:text-zinc-300">
                      {item.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-zinc-200 p-4 dark:border-zinc-800">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {mode === "file"
                ? "Click a .yaml file to select"
                : "Select current directory or navigate to choose location"}
            </p>
            <div className="flex gap-2">
              {mode === "directory" && (
                <Button onClick={handleSelectCurrentDirectory} disabled={!currentPath}>
                  Select This Directory
                </Button>
              )}
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body,
  );
}
