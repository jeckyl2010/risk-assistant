"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { FolderOpen, Loader2, Plus } from "lucide-react";
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

export function NewSystemForm() {
  const [isCreating, setIsCreating] = useState(false);
  const [showBrowser, setShowBrowser] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      path: "",
    },
  });

  const systemId = watch("id");
  const defaultPath = systemId ? `./systems/${systemId}.yaml` : "./systems/[SystemID].yaml";

  const handleDirectorySelect = (dirPath: string) => {
    // Construct full path with system ID
    const fileName = systemId ? `${systemId}.yaml` : "system.yaml";
    const fullPath =
      dirPath.endsWith("\\") || dirPath.endsWith("/")
        ? `${dirPath}${fileName}`
        : `${dirPath}\\${fileName}`;
    setValue("path", fullPath);
  };

  async function onSubmit(data: FormData) {
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
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="system-id">System ID</Label>
          <Input
            id="system-id"
            {...register("id")}
            placeholder="e.g. shopfloor-analytics"
            disabled={isCreating}
          />
          {errors.id && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-600 dark:text-red-400"
            >
              {errors.id.message}
            </motion.p>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="system-path">
            File Path <span className="text-sm font-normal text-gray-500">(optional)</span>
          </Label>
          <div className="flex gap-2">
            <Input
              id="system-path"
              {...register("path")}
              placeholder={defaultPath}
              disabled={isCreating}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="default"
              onClick={() => setShowBrowser(true)}
              disabled={isCreating}
              className="gap-1.5"
            >
              <FolderOpen className="h-4 w-4" />
              Browse
            </Button>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Relative (./systems/...) or absolute (C:\Repos\...). Defaults to ./systems/
            {"{SystemID}"}.yaml
          </p>
        </div>
      </div>

      <Button type="submit" disabled={isCreating} className="self-start" size="default">
        {isCreating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating…
          </>
        ) : (
          <>
            <Plus className="h-4 w-4" />
            Create System
          </>
        )}
      </Button>

      <FileBrowserModal
        isOpen={showBrowser}
        onClose={() => setShowBrowser(false)}
        onSelect={handleDirectorySelect}
        mode="directory"
        title="Select Directory for System File"
      />
    </motion.form>
  );
}
