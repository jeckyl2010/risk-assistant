"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { FileSearch, FolderPlus, Loader2 } from "lucide-react";
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
  path: z.string().min(1, "File path is required"),
});

type FormData = z.infer<typeof formSchema>;

export function AddExistingSystemForm() {
  const [isAdding, setIsAdding] = useState(false);
  const [showBrowser, setShowBrowser] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const handleFileSelect = (filePath: string) => {
    setValue("path", filePath);
  };

  async function onSubmit(data: FormData) {
    setIsAdding(true);
    try {
      const res = await fetch("/api/systems/add", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
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
          <Label htmlFor="system-path">Existing System File Path</Label>
          <div className="flex gap-2">
            <Input
              id="system-path"
              {...register("path")}
              placeholder="./systems/MySystem.yaml or C:\Repos\team-systems\MySystem.yaml"
              disabled={isAdding}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="default"
              onClick={() => setShowBrowser(true)}
              disabled={isAdding}
              className="gap-1.5"
            >
              <FileSearch className="h-4 w-4" />
              Browse
            </Button>
          </div>
          {errors.path && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-600 dark:text-red-400"
            >
              {errors.path.message}
            </motion.p>
          )}
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Path to an existing system YAML file. Relative or absolute paths supported.
          </p>
        </div>
      </div>

      <Button type="submit" disabled={isAdding} variant="outline" className="self-start" size="default">
        {isAdding ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Adding…
          </>
        ) : (
          <>
            <FolderPlus className="h-4 w-4" />
            Add to Portfolio
          </>
        )}
      </Button>

      <FileBrowserModal
        isOpen={showBrowser}
        onClose={() => setShowBrowser(false)}
        onSelect={handleFileSelect}
        mode="file"
        title="Select Existing System File"
      />
    </motion.form>
  );
}
