'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

interface MarkdownViewerProps {
  content: string
  className?: string
}

export function MarkdownViewer({ content, className }: MarkdownViewerProps) {
  return (
    <div 
      className={cn(
        'markdown-content',
        className
      )}
      style={{
        fontSize: '0.875rem',
        lineHeight: '1.5',
      }}
    >
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({node, ...props}) => <p style={{ marginBottom: '0.5rem', color: 'inherit' }} {...props} />,
          strong: ({node, ...props}) => <strong style={{ fontWeight: 600 }} {...props} />,
          em: ({node, ...props}) => <em {...props} />,
          ul: ({node, ...props}) => (
            <ul 
              style={{ 
                listStyleType: 'disc',
                paddingLeft: '1.5rem',
                marginTop: '0.5rem',
                marginBottom: '0.5rem'
              }} 
              {...props} 
            />
          ),
          ol: ({node, ...props}) => (
            <ol 
              style={{ 
                listStyleType: 'decimal',
                paddingLeft: '1.5rem',
                marginTop: '0.5rem',
                marginBottom: '0.5rem'
              }} 
              {...props} 
            />
          ),
          li: ({node, ...props}) => (
            <li 
              style={{ 
                marginBottom: '0.25rem',
                display: 'list-item'
              }} 
              {...props} 
            />
          ),
          code: ({node, ...props}) => {
            const inline = 'inline' in props ? props.inline : false
            return inline ? (
              <code 
                style={{
                  backgroundColor: 'rgb(243 244 246)',
                  padding: '0.125rem 0.375rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.8125rem',
                  fontFamily: 'ui-monospace, monospace'
                }}
                {...props} 
              />
            ) : (
              <code {...props} />
            )
          },
          a: ({node, ...props}) => (
            <a 
              style={{ color: 'rgb(79 70 229)', textDecoration: 'underline' }}
              {...props} 
            />
          ),
        }}
      >
        {content.trim()}
      </ReactMarkdown>
    </div>
  )
}
