/**
 * Application-wide constants
 */

// Section IDs
export const SECTION_IDS = {
  DESCRIPTION: 'description',
  BASE: 'base',
  RESULTS: 'results',
  DIFF: 'diff',
} as const

export type SectionId = typeof SECTION_IDS[keyof typeof SECTION_IDS] | string

// State transition delays
export const STATE_DELAYS = {
  SUCCESS_RESET: 2000, // Time before success state resets to idle
} as const

// API Endpoints
export const API_ENDPOINTS = {
  SYSTEMS: '/api/systems',
  EVALUATE: '/api/evaluate',
  DIFF: '/api/diff',
  MODEL: '/api/model',
} as const

// Async state types
export const ASYNC_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
} as const

export type AsyncState = typeof ASYNC_STATES[keyof typeof ASYNC_STATES]

// Question field paths
export const QUESTION_PATHS = {
  REASONS_SUFFIX: '_reasons',
} as const

// Sentinel values
export const SENTINEL_VALUES = {
  UNSET: '__unset__',
} as const

// Default model directory
export const DEFAULT_MODEL_DIR = 'model'
