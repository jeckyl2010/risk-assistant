import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const requestedPath = searchParams.get('path')
  
  // Default to user's home directory on Windows
  const startPath = requestedPath || (os.platform() === 'win32' ? 'C:\\' : os.homedir())
  
  try {
    const entries = await fs.readdir(startPath, { withFileTypes: true })
    
    const items = await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(startPath, entry.name)
        const isDirectory = entry.isDirectory()
        
        // For YAML files, include them; for directories, always include
        const isYaml = !isDirectory && (entry.name.endsWith('.yaml') || entry.name.endsWith('.yml'))
        
        if (!isDirectory && !isYaml) {
          return null
        }
        
        return {
          name: entry.name,
          path: fullPath,
          isDirectory,
          isYaml
        }
      })
    )
    
    // Filter out nulls and sort: directories first, then files
    const filtered = items.filter(Boolean).sort((a, b) => {
      if (a!.isDirectory && !b!.isDirectory) return -1
      if (!a!.isDirectory && b!.isDirectory) return 1
      return a!.name.localeCompare(b!.name)
    })
    
    // Get parent directory
    const parent = path.dirname(startPath)
    const canGoUp = startPath !== parent
    
    return NextResponse.json({
      currentPath: startPath,
      parent: canGoUp ? parent : null,
      items: filtered
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to read directory'
    return NextResponse.json(
      { error: message, currentPath: startPath },
      { status: 400 }
    )
  }
}
