import path from 'path'
import fs from 'fs'

export function findRepoRoot(startDir: string): string {
  let current = startDir
  // Walk upwards until we find a model manifest
  for (let i = 0; i < 20; i++) {
    const candidate = path.join(current, 'model', 'model.manifest.yaml')
    if (fs.existsSync(candidate)) return current
    const parent = path.dirname(current)
    if (parent === current) break
    current = parent
  }
  // Fallback: assume web/ is directly under repo root
  return path.resolve(startDir, '..')
}
