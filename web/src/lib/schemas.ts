/**
 * Zod validation schemas for API request/response bodies
 */

import { z } from "zod";

/**
 * Facts schema - validates the system facts object structure
 */
export const FactsSchema = z
  .object({
    scope: z.string(),
    description: z.string().optional(),
    base: z.record(z.string(), z.unknown()),
  })
  .passthrough(); // Allow additional domain properties

/**
 * Evaluate API request schema
 */
export const EvaluateRequestSchema = z.object({
  facts: FactsSchema,
  modelDir: z.string().optional().default("model"),
});

/**
 * Diff API request schema
 */
export const DiffRequestSchema = z.object({
  facts: FactsSchema,
  oldModelDir: z.string(),
  newModelDir: z.string(),
});

/**
 * Save system request schema
 */
export const SaveSystemRequestSchema = z.object({
  facts: FactsSchema,
});

/**
 * Derived control schema
 */
export const DerivedControlSchema = z.object({
  id: z.string(),
  title: z.string(),
  scope: z.string(),
  enforcement_intent: z.string(),
  activation_phase: z.string(),
  evidence_type: z.array(z.string()),
  because: z.array(z.record(z.string(), z.unknown())),
});

/**
 * Required question schema
 */
export const RequiredQuestionSchema = z.object({
  id: z.string(),
  answered: z.boolean(),
});

/**
 * Evaluate API response schema
 */
export const EvaluateResponseSchema = z.object({
  modelDir: z.string(),
  modelVersion: z.string(),
  result: z.object({
    activated_domains: z.array(z.string()),
    required_questions: z.array(RequiredQuestionSchema),
    derived_controls: z.array(DerivedControlSchema),
  }),
});

/**
 * Diff API response schema
 */
export const DiffResponseSchema = z.object({
  old: z.object({
    modelDir: z.string(),
    modelVersion: z.string(),
  }),
  new: z.object({
    modelDir: z.string(),
    modelVersion: z.string(),
  }),
  controls: z.object({
    added: z.array(z.string()),
    removed: z.array(z.string()),
  }),
  questions: z.object({
    newlyMissing: z.array(z.string()),
    noLongerMissing: z.array(z.string()),
  }),
  activatedDomains: z.object({
    old: z.array(z.string()),
    new: z.array(z.string()),
  }),
});

/**
 * Type exports for use in components
 */
export type Facts = z.infer<typeof FactsSchema>;
export type EvaluateRequest = z.infer<typeof EvaluateRequestSchema>;
export type DiffRequest = z.infer<typeof DiffRequestSchema>;
export type SaveSystemRequest = z.infer<typeof SaveSystemRequestSchema>;
export type DerivedControl = z.infer<typeof DerivedControlSchema>;
export type RequiredQuestion = z.infer<typeof RequiredQuestionSchema>;
export type EvaluateResponse = z.infer<typeof EvaluateResponseSchema>;
export type DiffResponse = z.infer<typeof DiffResponseSchema>;
