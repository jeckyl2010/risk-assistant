"use client";

import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

interface ErrorAlertProps {
  message: string;
}

export function ErrorAlert({ message }: ErrorAlertProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 rounded-xl border border-red-300/60 bg-red-50/90 px-4 py-3 text-sm text-red-800 shadow-md backdrop-blur dark:border-red-800/60 dark:bg-red-950/40 dark:text-red-200"
    >
      <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
      <div>
        <div className="font-medium">Error</div>
        <div className="mt-1">{message}</div>
      </div>
    </motion.div>
  );
}
