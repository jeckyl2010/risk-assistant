/**
 * Custom hooks for system-related API operations
 */

import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { Facts } from "@/components/systemEditor/facts";
import { ApiError, api } from "@/lib/apiClient";

type AsyncState = "idle" | "loading" | "success" | "error";

export type EvaluateResult = {
  modelDir: string;
  modelVersion: string;
  result: {
    activated_domains: string[];
    required_questions: { id: string; answered: boolean }[];
    derived_controls: Array<{
      id: string;
      title: string;
      scope: string;
      enforcement_intent: string;
      activation_phase: string;
      evidence_type: string[];
      because: Record<string, unknown>[];
    }>;
  };
};

export type DiffResult = {
  old: { modelDir: string; modelVersion: string };
  new: { modelDir: string; modelVersion: string };
  controls: { added: string[]; removed: string[] };
  questions: { newlyMissing: string[]; noLongerMissing: string[] };
  activatedDomains: { old: string[]; new: string[] };
};

/**
 * Hook for saving system facts
 */
export function useSaveSystem(systemId: string) {
  const [state, setState] = useState<AsyncState>("idle");
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(
    async (facts: Facts) => {
      setError(null);
      setState("loading");

      try {
        await api.put(`/api/systems/${encodeURIComponent(systemId)}`, { facts });
        setState("success");
        toast.success("System saved successfully");

        // Reset to idle after showing success
        setTimeout(() => setState("idle"), 2000);
      } catch (err) {
        setState("error");
        const message = err instanceof ApiError ? err.message : "Failed to save system";
        setError(message);
        toast.error(message);
      }
    },
    [systemId],
  );

  return { save, state, error, isLoading: state === "loading", isSuccess: state === "success" };
}

/**
 * Hook for evaluating system against model
 */
export function useEvaluateSystem() {
  const [state, setState] = useState<AsyncState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EvaluateResult | null>(null);

  const evaluate = useCallback(async (facts: Facts, modelDir: string) => {
    setError(null);
    setState("loading");

    try {
      const data = await api.post<EvaluateResult>("/api/evaluate", { facts, modelDir });
      setResult(data);
      setState("success");
      toast.success("Evaluation completed");
      return data;
    } catch (err) {
      setState("error");
      const message = err instanceof ApiError ? err.message : "Failed to evaluate system";
      setError(message);
      toast.error(message);
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState("idle");
    setError(null);
    setResult(null);
  }, []);

  return {
    evaluate,
    reset,
    state,
    error,
    result,
    isLoading: state === "loading",
    isSuccess: state === "success",
  };
}

/**
 * Hook for comparing system against different model versions
 */
export function useDiffSystem() {
  const [state, setState] = useState<AsyncState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DiffResult | null>(null);

  const diff = useCallback(async (facts: Facts, oldModelDir: string, newModelDir: string) => {
    setError(null);
    setState("loading");

    try {
      const data = await api.post<DiffResult>("/api/diff", {
        facts,
        oldModelDir,
        newModelDir,
      });
      setResult(data);
      setState("success");
      toast.success("Diff completed");
      return data;
    } catch (err) {
      setState("error");
      const message = err instanceof ApiError ? err.message : "Failed to run diff";
      setError(message);
      toast.error(message);
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState("idle");
    setError(null);
    setResult(null);
  }, []);

  return {
    diff,
    reset,
    state,
    error,
    result,
    isLoading: state === "loading",
    isSuccess: state === "success",
  };
}
