'use client'

import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { Loader2, Star, GitFork, Calendar, Link } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { useEffect, useState } from 'react'

import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { CollectionItem, BlogItem } from '@/types/collection'
import { BlogDetailDialog } from './blog-detail-dialog'

interface CollectionPreviewProps {
  drawerOpen: boolean
  setDrawerOpenAction: (open: boolean) => void
  selectedItem: CollectionItem | null
}

export const CollectionPreview = ({ drawerOpen, setDrawerOpenAction, selectedItem }: CollectionPreviewProps) => {
  const [collectionWithItems, setCollectionWithItems] = useState<CollectionItem | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedBlogItem, setSelectedBlogItem] = useState<BlogItem | null>(null)
  const [isBlogDetailOpen, setIsBlogDetailOpen] = useState(false)

  useEffect(() => {
    const fetchCollectionItems = async () => {
      if (!selectedItem) return

      setIsLoading(true)
      try {
        const response = await fetch(`/api/collection/${selectedItem.id}/items`)
        const data = await response.json()

        if (data.success) {
          setCollectionWithItems(data.collection)
        }
      } catch (error) {
        console.error('Failed to fetch collection items:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (drawerOpen && selectedItem) {
      fetchCollectionItems()
    }
  }, [drawerOpen, selectedItem])

  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  return (
    <>
      <Drawer direction="right" open={drawerOpen} onOpenChange={setDrawerOpenAction}>
        <DrawerContent className="h-full">
          <div className="flex h-full flex-col">
            <DrawerHeader className="sticky top-0 z-10 border-b bg-background pb-2">
              {selectedItem && <DrawerTitle>{selectedItem.name}</DrawerTitle>}
              <DrawerDescription>
                {selectedItem &&
                  `Source Type: ${selectedItem.sourceType} | Last Sync: ${selectedItem.lastSyncTime || 'Never'}`}
              </DrawerDescription>

              {/* GitHub Meta Info (Fixed position) */}
              {selectedItem?.sourceType === 'GITHUB' && collectionWithItems?.githubItems?.[0] && (
                <div className="mt-2 flex flex-wrap items-center gap-4 rounded-md bg-card/50 p-3 text-sm">
                  {collectionWithItems.githubItems[0].language && (
                    <div className="flex items-center">
                      <span className="mr-2 inline-block h-3 w-3 rounded-full bg-primary"></span>
                      {collectionWithItems.githubItems[0].language}
                    </div>
                  )}
                  {collectionWithItems.githubItems[0].stars !== undefined && (
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      {collectionWithItems.githubItems[0].stars}
                    </span>
                  )}
                  {collectionWithItems.githubItems[0].forks !== undefined && (
                    <span className="flex items-center gap-1">
                      <GitFork className="h-4 w-4" />
                      {collectionWithItems.githubItems[0].forks}
                    </span>
                  )}
                  {collectionWithItems.githubItems[0].lastSyncTime && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(collectionWithItems.githubItems[0].lastSyncTime).toLocaleDateString()}
                    </span>
                  )}
                  {collectionWithItems.githubItems[0].url && (
                    <a
                      href={collectionWithItems.githubItems[0].url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline">
                      <Link className="h-4 w-4" />
                      View Repository
                    </a>
                  )}
                </div>
              )}
            </DrawerHeader>
            <div className="flex-1 overflow-auto px-4">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading collection items...</p>
                  </div>
                </div>
              ) : collectionWithItems ? (
                <div className="flex flex-col gap-4 pb-8">
                  {collectionWithItems.docItems?.map((item) => (
                    <div key={item.id} className="rounded-md bg-gray-100 p-4">
                      <div className="whitespace-pre-wrap">{item.content}</div>
                    </div>
                  ))}
                  {collectionWithItems.blogItems?.map((item) => (
                    <div
                      key={item.id}
                      className="cursor-pointer rounded-md border bg-card p-4 transition-colors hover:bg-accent"
                      onClick={() => {
                        setSelectedBlogItem(item)
                        setIsBlogDetailOpen(true)
                      }}>
                      <h3 className="mb-2 font-semibold">{item.title}</h3>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeHighlight]}>
                          {truncateContent(item.content)}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ))}
                  {collectionWithItems.githubItems?.map((item) => (
                    <div key={item.id} className="rounded-md bg-card p-4 shadow-sm">
                      <h3 className="mb-2 font-semibold">{item.title}</h3>
                      {item.readme && (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeHighlight]}>
                            {item.readme}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <BlogDetailDialog item={selectedBlogItem} open={isBlogDetailOpen} onOpenChange={setIsBlogDetailOpen} />
    </>
  )
}
