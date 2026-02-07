/**
 * Centralized formatting utilities for converting data model values
 * to human-readable display strings throughout the application.
 * 
 * Uses smart auto-conversion as default with special-case overrides only
 * for exceptional values that can't be auto-converted (like abbreviations).
 */

/**
 * Format snake_case, kebab-case, or camelCase to Title Case
 * Examples: "non_eu" → "Non EU", "deployment_model" → "Deployment Model"
 */
export function formatIdentifier(id: string): string {
  // Handle common abbreviations and special cases
  const specialCases: Record<string, string> = {
    'eu': 'EU',
    'us': 'US',
    'uk': 'UK',
    'api': 'API',
    'url': 'URL',
    'id': 'ID',
    'sql': 'SQL',
    'json': 'JSON',
    'xml': 'XML',
    'html': 'HTML',
    'css': 'CSS',
    'http': 'HTTP',
    'https': 'HTTPS',
    'ssh': 'SSH',
    'ftp': 'FTP',
    'dns': 'DNS',
    'ip': 'IP',
    'vpn': 'VPN',
    'ai': 'AI',
    'ml': 'ML',
    'ci': 'CI',
    'cd': 'CD',
    'iam': 'IAM',
    'mfa': 'MFA',
    'sso': 'SSO',
  }

  return id
    .split(/[-_]/)
    .map(word => {
      const lower = word.toLowerCase()
      return specialCases[lower] || capitalizeFirst(word)
    })
    .join(' ')
}

/**
 * Format boolean values as Yes/No
 */
export function formatBoolean(value: boolean | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return value ? 'Yes' : 'No'
}

/**
 * Format activation phase
 * Auto-converts via formatIdentifier, with overrides for exceptional cases only
 */
export function formatPhase(phase: string): string {
  // No special cases needed - auto-conversion handles everything
  return formatIdentifier(phase)
}

/**
 * Format reference type
 * Auto-converts via formatIdentifier, with overrides for exceptional cases only
 */
export function formatReferenceType(type: string): string {
  // No special cases needed - auto-conversion handles everything
  return formatIdentifier(type)
}

/**
 * Format scope
 * Auto-converts via formatIdentifier, with overrides for exceptional cases only
 */
export function formatScope(scope: string): string {
  // No special cases needed - auto-conversion handles everything
  return formatIdentifier(scope)
}

/**
 * Format enforcement intent
 * Auto-converts via formatIdentifier, with overrides for exceptional cases only
 */
export function formatEnforcementIntent(intent: string): string {
  // No special cases needed - auto-conversion handles everything
  return formatIdentifier(intent)
}

/**
 * Format evidence type
 * Auto-converts via formatIdentifier, with overrides for exceptional cases only
 */
export function formatEvidenceType(type: string): string {
  // No special cases needed - auto-conversion handles everything
  return formatIdentifier(type)
}

/**
 * Format question type
 */
export function formatQuestionType(type: string): string {
  // These genuinely need special descriptions
  const specialDescriptions: Record<string, string> = {
    bool: 'Yes/No',
    enum: 'Single Choice',
    set: 'Multiple Choice',
  }
  return specialDescriptions[type] || formatIdentifier(type)
}

/**
 * Capitalize first letter of a string
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Format any answer value for display
 */
export function formatAnswerValue(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'boolean') return formatBoolean(value)
  if (Array.isArray(value)) {
    return value.map(v => 
      typeof v === 'string' ? formatIdentifier(v) : String(v)
    ).join(', ')
  }
  if (typeof value === 'string') return formatIdentifier(value)
  return String(value)
}
