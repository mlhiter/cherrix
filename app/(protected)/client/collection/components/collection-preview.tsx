'use client'

import rehypeRaw from 'rehype-raw'
import Image from 'next/image'
import remarkGfm from 'remark-gfm'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import { useEffect, useState, useRef } from 'react'
import { Loader2, Star, GitFork, Calendar, Link, ExternalLink, List } from 'lucide-react'

import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { CollectionItem, BlogItem, DocItem } from '@/types/collection'
import { BlogDetailDialog } from './blog-detail-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const isolationStyles = `
  .content-isolation-container * {
    position: static !important;
    z-index: auto !important;
    top: auto !important;
    left: auto !important;
    right: auto !important;
    bottom: auto !important;
    transform: none !important;
  }

  .content-isolation-container *[style*="position:fixed"],
  .content-isolation-container *[style*="position: fixed"] {
    display: none !important;
  }

  .content-isolation-container div[class*="fixed"],
  .content-isolation-container div[class*="sticky"],
  .content-isolation-container header,
  .content-isolation-container nav[class*="fixed"],
  .content-isolation-container nav[class*="sticky"] {
    position: relative !important;
    transform: none !important;
  }

  .content-isolation-container iframe {
    max-width: 100%;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    position: static !important;
    z-index: 1 !important;
  }

  .content-isolation-container .fixed,
  .content-isolation-container [class*="navbar"],
  .content-isolation-container [class*="header"],
  .content-isolation-container [class*="menu"],
  .content-isolation-container [class*="topbar"],
  .content-isolation-container [class*="toolbar"] {
    position: static !important;
  }
`

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
                  `Source Type: ${selectedItem.sourceType} | Last Sync: ${selectedItem.lastSyncTime ? new Date(selectedItem.lastSyncTime).toLocaleString() : 'Never'}`}
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

              {/* Doc Meta Info (Fixed position) */}
              {selectedItem?.sourceType === 'OFFICIAL_DOC' && collectionWithItems?.docItems?.[0] && (
                <div className="mt-2 flex flex-wrap items-center gap-4 rounded-md bg-card/50 p-3 text-sm">
                  {collectionWithItems.docItems[0].title && (
                    <div className="flex items-center">
                      <span className="mr-2 font-semibold">{collectionWithItems.docItems[0].title || 'Document'}</span>
                    </div>
                  )}
                  {collectionWithItems.docItems[0].lastUpdated && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(collectionWithItems.docItems[0].lastUpdated).toLocaleDateString()}
                    </span>
                  )}
                  {collectionWithItems.docItems[0].url && (
                    <a
                      href={collectionWithItems.docItems[0].url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline">
                      <ExternalLink className="h-4 w-4" />
                      View Original
                    </a>
                  )}
                </div>
              )}
            </DrawerHeader>
            <div className="flex-1 overflow-auto p-4">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading collection items...</p>
                  </div>
                </div>
              ) : collectionWithItems ? (
                <div className="flex flex-col gap-4 pb-4">
                  {collectionWithItems.docItems?.map((item) => <DocItemPreview key={item.id} item={item} />)}
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
                    <div key={item.id} className="rounded-md bg-card p-4">
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

const DocItemPreview = ({ item }: { item: DocItem }) => {
  const [activeTab, setActiveTab] = useState<string>('content')
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (activeTab === 'content' && contentRef.current) {
      const container = contentRef.current

      const fixedElements = container.querySelectorAll(
        '[style*="position:fixed"], [style*="position: fixed"], [style*="position:sticky"], [style*="position: sticky"]'
      )

      fixedElements.forEach((el) => {
        if (el instanceof HTMLElement) {
          el.style.position = 'static'
          el.style.zIndex = 'auto'
          el.style.top = 'auto'
          el.style.left = 'auto'
        }
      })

      const iframes = container.querySelectorAll('iframe')
      iframes.forEach((iframe) => {
        iframe.style.maxWidth = '100%'
        iframe.style.position = 'static'
        iframe.style.zIndex = '1'
      })
    }
  }, [activeTab, item.content])

  return (
    <div className="h-full rounded-md bg-card p-2">
      <style dangerouslySetInnerHTML={{ __html: isolationStyles }} />

      <Tabs defaultValue="content" onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="content">Content</TabsTrigger>
          {item.tableOfContents && item.tableOfContents.length > 0 && <TabsTrigger value="toc">TOC</TabsTrigger>}
          {item.images && item.images.length > 0 && (
            <TabsTrigger value="images">Images ({item.images.length})</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="content" className="p-0">
          <div
            className="content-isolation-container relative"
            style={{
              isolation: 'isolate',
              contain: 'content',
              transform: 'translateZ(0)',
            }}>
            <div
              ref={contentRef}
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: item.content }}
            />
          </div>
        </TabsContent>

        {item.tableOfContents && item.tableOfContents.length > 0 && (
          <TabsContent value="toc" className="p-0">
            <div className="space-y-1">
              {item.tableOfContents.map((tocItem, idx) => (
                <a
                  key={idx}
                  href={tocItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-1 rounded-md p-1 hover:bg-accent hover:text-accent-foreground ${
                    tocItem.level === 1 ? 'font-medium' : tocItem.level === 2 ? 'ml-4' : 'ml-8'
                  }`}>
                  <List className="h-4 w-4" />
                  {tocItem.text}
                </a>
              ))}
            </div>
          </TabsContent>
        )}

        {item.images && item.images.length > 0 && (
          <TabsContent value="images" className="p-0">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {item.images.map((img, idx) => (
                <div key={idx} className="overflow-hidden rounded-md border">
                  <a href={img.url} target="_blank" rel="noopener noreferrer">
                    <div className="relative h-40 w-full">
                      <Image
                        src={img.url}
                        alt={img.alt || 'Document Image'}
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                        fill
                      />
                    </div>
                    {img.alt && <p className="truncate bg-muted p-2 text-xs">{img.alt}</p>}
                  </a>
                </div>
              ))}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
