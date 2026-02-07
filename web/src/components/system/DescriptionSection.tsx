'use client'

import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

interface DescriptionSectionProps {
  description: string
  onChange: (value: string) => void
}

export function DescriptionSection({ description, onChange }: DescriptionSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
            Overview
          </CardTitle>
          <CardDescription>
            Add context about what this risk assessment covers, assumptions, scope, and links
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={description}
            onChange={(e) => onChange(e.target.value)}
            placeholder="e.g. Risk assessment for the Shopfloor Analytics data pipeline handling production telemetry..."
            className="min-h-[150px] resize-none"
          />
        </CardContent>
      </Card>
    </motion.div>
  )
}
