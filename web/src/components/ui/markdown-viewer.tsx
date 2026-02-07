'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'
import { cn } from '@/lib/utils'

interface MarkdownViewerProps {
  content: string
  className?: string
}

export function MarkdownViewer({ content, className }: MarkdownViewerProps) {
  return (
    <div
      className={cn(
        'prose prose-sm prose-zinc dark:prose-invert max-w-none',
        'prose-headings:font-semibold prose-headings:text-zinc-900 dark:prose-headings:text-zinc-50',
        'prose-p:text-zinc-700 dark:prose-p:text-zinc-300',
        'prose-a:text-indigo-600 hover:prose-a:text-indigo-700 dark:prose-a:text-indigo-400 dark:hover:prose-a:text-indigo-300',
        'prose-code:text-purple-600 dark:prose-code:text-purple-400 prose-code:bg-purple-50/50 dark:prose-code:bg-purple-950/30 prose-code:px-1 prose-code:py-0.5 prose-code:rounded',
        'prose-pre:bg-zinc-900 dark:prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-700',
        'prose-strong:text-zinc-900 dark:prose-strong:text-zinc-50 prose-strong:font-semibold',
        'prose-ul:text-zinc-700 dark:prose-ul:text-zinc-300',
        'prose-ol:text-zinc-700 dark:prose-ol:text-zinc-300',
        'prose-li:marker:text-indigo-500 dark:prose-li:marker:text-indigo-400',
        'prose-blockquote:border-l-indigo-400 dark:prose-blockquote:border-l-indigo-600 prose-blockquote:text-zinc-700 dark:prose-blockquote:text-zinc-300',
        'prose-hr:border-zinc-200 dark:prose-hr:border-zinc-800',
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
