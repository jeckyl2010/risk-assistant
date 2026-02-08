"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { FolderOpen, FolderPlus, Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { FileBrowserModal } from "@/components/FileBrowserModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  id: z
    .string()
    .min(1, "System ID is required")
    .regex(/^[a-zA-Z0-9-_]+$/, "Only letters, numbers, dashes, and underscores allowed"),
  path: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function SystemManagement() {
  const [mode, setMode] = useState<"none" | "create">("none");
  const [isCreating, setIsCreating] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showBrowser, setShowBrowser] = useState(false);
  const [browserMode, setBrowserMode] = useState<"file" | "directory">("file");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      path: "",
    },
  });

  const systemId = watch("id");
  const customPath = watch("path");

  const handleCreateClick = () => {
    setMode("create");
    reset();
  };

  const handleAddExistingClick = () => {
    setBrowserMode("file");
    setShowBrowser(true);
  };

  const handleDirectorySelect = (dirPath: string) => {
    const fileName = systemId ? `${systemId}.yaml` : "system.yaml";
    const fullPath =
      dirPath.endsWith("\\") || dirPath.endsWith("/")
        ? `${dirPath}${fileName}`
        : `${dirPath}\\${fileName}`;
    setValue("path", fullPath);
  };

  const handleFileSelect = async (filePath: string) => {
    setIsAdding(true);
    try {
      const res = await fetch("/api/systems/add", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ path: filePath }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || `Failed: ${res.status}`);
      }

      const json = (await res.json()) as { id: string };
      toast.success("System added to portfolio!");
      router.refresh();
      router.push(`/systems/${encodeURIComponent(json.id)}`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to add system");
    } finally {
      setIsAdding(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsCreating(true);
    try {
      const res = await fetch("/api/systems", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const json = (await res.json()) as { id: string };
      toast.success("System created successfully!");
      router.push(`/systems/${encodeURIComponent(json.id)}`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to create system");
    } finally {
      setIsCreating(false);
    }
  };

  const displayPath =
    customPath || (systemId ? `./systems/${systemId}.yaml` : "./systems/[SystemID].yaml");

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Button
          size="lg"
          onClick={handleCreateClick}
          disabled={isAdding}
          className="h-auto flex-col gap-2 py-6"
        >
          <Plus className="h-6 w-6" />
          <div className="flex flex-col gap-1">
            <span className="font-semibold">Create New System</span>
            <span className="text-xs font-normal opacity-90">Start a new risk assessment</span>
          </div>
        </Button>

        <Button
          size="lg"
          variant="outline"
          onClick={handleAddExistingClick}
          disabled={isAdding || isCreating}
          className="h-auto flex-col gap-2 py-6"
        >
          {isAdding ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" />
              <div className="flex flex-col gap-1">
                <span className="font-semibold">Adding System...</span>
                <span className="text-xs font-normal opacity-90">Please wait</span>
              </div>
            </>
          ) : (
            <>
              <FolderPlus className="h-6 w-6" />
              <div className="flex flex-col gap-1">
                <span className="font-semibold">Add Existing System</span>
                <span className="text-xs font-normal opacity-90">Import from filesystem</span>
              </div>
            </>
          )}
        </Button>
      </div>

      {/* Create Form (Expandable) */}
      <AnimatePresence>
        {mode === "create" && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit(onSubmit)}
            className="overflow-hidden"
          >
            <div className="space-y-4 rounded-lg border border-indigo-200 bg-indigo-50/50 p-4 dark:border-indigo-900 dark:bg-indigo-950/20">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex flex-1 flex-col gap-2">
                  <Label htmlFor="system-id">System ID</Label>
                  <Input
                    id="system-id"
                    {...register("id")}
                    placeholder="e.g. shopfloor-analytics"
                    disabled={isCreating}
                    autoFocus
                  />
                  {errors.id && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.id.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2 sm:w-auto">
                  <Label>&nbsp;</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="default"
                    onClick={() => {
                      setBrowserMode("directory");
                      setShowBrowser(true);
                    }}
                    disabled={isCreating || !systemId}
                    className="gap-2"
                  >
                    <FolderOpen className="h-4 w-4" />
                    Choose Location
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-xs text-zinc-600 dark:text-zinc-400">Save Location</Label>
                <code className="rounded bg-white px-3 py-2 text-sm text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                  {displayPath}
                </code>
              </div>

              <div className="flex items-center gap-2">
                <Button type="submit" disabled={isCreating} className="gap-2">
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Create System
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setMode("none");
                    reset();
                  }}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* File Browser Modal */}
      <FileBrowserModal
        isOpen={showBrowser}
        onClose={() => setShowBrowser(false)}
        onSelect={browserMode === "file" ? handleFileSelect : handleDirectorySelect}
        mode={browserMode}
        title={
          browserMode === "file"
            ? "Select Existing System File"
            : "Select Directory for System File"
        }
      />
    </div>
  );
}
