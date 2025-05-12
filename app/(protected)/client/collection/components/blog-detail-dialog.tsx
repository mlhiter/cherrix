import Image from 'next/image'
import { format } from 'date-fns'
import rehypeRaw from 'rehype-raw'
import ReactMarkdown from 'react-markdown'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { BlogItem } from '@/types/collection'

interface BlogDetailDialogProps {
  item: BlogItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const BlogDetailDialog = ({ item, open, onOpenChange }: BlogDetailDialogProps) => {
  if (!item) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{item.title}</DialogTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {item.author && <span>By {item.author}</span>}
            {item.publishDate && <span>Published on {format(new Date(item.publishDate), 'MMMM d, yyyy')}</span>}
          </div>
        </DialogHeader>
        <div className="prose prose-sm dark:prose-invert max-w-none flex-1 overflow-y-auto">
          <ReactMarkdown
            rehypePlugins={[rehypeRaw]}
            components={{
              img: ({ node, ...props }) => {
                const src = (props.src as string) || ''
                const alt = props.alt || 'Blog image'

                const isRelativePath = typeof src === 'string' && !src.startsWith('http')
                const imageUrl = isRelativePath ? new URL(src, item.url).toString() : src

                return (
                  <span className="my-4 block">
                    <span className="relative block aspect-video w-full overflow-hidden rounded-lg bg-muted">
                      <Image
                        src={imageUrl}
                        alt={alt}
                        fill
                        className="object-cover"
                        unoptimized={true}
                        onError={(e) => {
                          const container = (e.target as HTMLElement).parentElement
                          if (container) {
                            container.innerHTML = `
                              <span class="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center">
                                <ImageIcon class="h-8 w-8 text-muted-foreground" />
                                <span class="text-sm text-muted-foreground">Cannot load image</span>
                                <a href="${imageUrl}" target="_blank" rel="noopener noreferrer" class="text-xs text-primary hover:underline">
                                  View original image
                                </a>
                              </span>
                            `
                          }
                        }}
                      />
                    </span>
                    {alt && alt !== 'Blog image' && (
                      <span className="mt-2 block text-center text-sm text-muted-foreground">{alt}</span>
                    )}
                  </span>
                )
              },
              a: ({ node, ...props }) => (
                <a {...props} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" />
              ),
              code: ({ node, className, children, ...props }) => {
                const match = /language-(\w+)/.exec(className || '')
                return match ? (
                  <div className="relative">
                    <div className="absolute right-2 top-2 text-xs text-muted-foreground">{match[1]}</div>
                    <code className={className} {...props} style={{ display: 'block', padding: '1rem' }}>
                      {children}
                    </code>
                  </div>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                )
              },
            }}>
            {item.content}
          </ReactMarkdown>
        </div>
      </DialogContent>
    </Dialog>
  )
}
