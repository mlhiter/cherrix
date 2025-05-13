'use client'

import { useState, useEffect } from 'react'
import { Activity, Brain, Clock, Library } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Cell, ResponsiveContainer } from 'recharts'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { CollectionItem } from '@/types/collection'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

interface ApiKeyType {
  id: string
  apiKey: string
  baseUrl: string
  modelId: string
  isActive: boolean
  userId: string
}

interface VectorStatus {
  vectorCount: number
}

interface ApiResponse<T> {
  success: boolean
  error?: string
  collections?: T[]
  apiKeys?: ApiKeyType[]
}

async function fetchCollections() {
  const res = await fetch('/api/collection')
  if (!res.ok) throw new Error('Failed to fetch collections')
  const data = await res.json()

  // Fetch items for each collection
  if (data.success && data.collections) {
    const collectionsWithItems = await Promise.all(
      data.collections.map(async (collection: CollectionItem) => {
        const itemsRes = await fetch(`/api/collection/${collection.id}/items`)
        const itemsData = await itemsRes.json()
        return itemsData.success ? itemsData.collection : collection
      })
    )
    return { ...data, collections: collectionsWithItems }
  }

  return data as Promise<ApiResponse<CollectionItem>>
}

async function fetchVectorStatus() {
  const res = await fetch('/api/document/vectorize/status')
  if (!res.ok) throw new Error('Failed to fetch vector status')
  return res.json() as Promise<VectorStatus>
}

async function fetchApiKeys() {
  const res = await fetch('/api/api-key')
  if (!res.ok) throw new Error('Failed to fetch API keys')
  return res.json() as Promise<ApiResponse<ApiKeyType>>
}

export default function HomePage() {
  const [collectionsData, setCollectionsData] = useState<ApiResponse<CollectionItem> | null>(null)
  const [vectorStatus, setVectorStatus] = useState<VectorStatus | null>(null)
  const [apiKeys, setApiKeys] = useState<ApiResponse<ApiKeyType> | null>(null)
  const [isLoadingCollections, setIsLoadingCollections] = useState(true)
  const [isLoadingVector, setIsLoadingVector] = useState(true)
  const [isLoadingKeys, setIsLoadingKeys] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingCollections(true)
        const collectionsResult = await fetchCollections()
        setCollectionsData(collectionsResult)
      } catch (error) {
        console.error('Failed to fetch collections:', error)
      } finally {
        setIsLoadingCollections(false)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    const loadVectorStatus = async () => {
      try {
        setIsLoadingVector(true)
        const vectorResult = await fetchVectorStatus()
        setVectorStatus(vectorResult)
      } catch (error) {
        console.error('Failed to fetch vector status:', error)
      } finally {
        setIsLoadingVector(false)
      }
    }
    loadVectorStatus()
  }, [])

  useEffect(() => {
    const loadApiKeys = async () => {
      try {
        setIsLoadingKeys(true)
        const keysResult = await fetchApiKeys()
        setApiKeys(keysResult)
      } catch (error) {
        console.error('Failed to fetch API keys:', error)
      } finally {
        setIsLoadingKeys(false)
      }
    }
    loadApiKeys()
  }, [])

  const collections = collectionsData?.collections || []
  const vectorizedCount = collections.filter((c: CollectionItem) => c.isVectorized).length
  const activeApiKeys = apiKeys?.apiKeys?.filter((key: ApiKeyType) => key.isActive).length || 0

  const getMonthlyData = () => {
    const now = new Date()
    const monthsData = new Array(6).fill(0).map((_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index))
      const monthStr = date.toLocaleString('en-US', { month: 'short' })
      const monthCollections = collections.filter((c) => {
        if (!c.lastSyncTime) return false
        const collectionDate = new Date(c.lastSyncTime)
        return collectionDate.getMonth() === date.getMonth() && collectionDate.getFullYear() === date.getFullYear()
      })

      // Count different types of items
      const docCount = monthCollections.reduce((acc, c) => acc + (c.docItems?.length || 0), 0)
      const blogCount = monthCollections.reduce((acc, c) => acc + (c.blogItems?.length || 0), 0)
      const githubCount = monthCollections.reduce((acc, c) => acc + (c.githubItems?.length || 0), 0)

      return {
        month: monthStr,
        docs: docCount || 0,
        blogs: blogCount || 0,
        github: githubCount || 0,
        collections: monthCollections.length || 0,
      }
    })
    return monthsData
  }

  const getModuleDistribution = () => {
    // Calculate total counts for each module
    const totalDocs = collections.reduce((acc, c) => acc + (c.docItems?.length || 0), 0)
    const totalBlogs = collections.reduce((acc, c) => acc + (c.blogItems?.length || 0), 0)
    const totalGithub = collections.reduce((acc, c) => acc + (c.githubItems?.length || 0), 0)
    const totalCollections = collections.length

    return [
      { name: 'Documents', value: totalDocs || 0, color: 'hsl(var(--chart-1))' },
      { name: 'Blogs', value: totalBlogs || 0, color: 'hsl(var(--chart-2))' },
      { name: 'GitHub', value: totalGithub || 0, color: 'hsl(var(--chart-3))' },
      { name: 'Collections', value: totalCollections || 0, color: 'hsl(var(--chart-4))' },
    ]
  }

  const monthlyData = getMonthlyData()
  const moduleData = getModuleDistribution()

  const chartConfig = {
    docs: {
      label: 'Documents',
      color: 'hsl(var(--chart-1))',
    },
    blogs: {
      label: 'Blogs',
      color: 'hsl(var(--chart-2))',
    },
    github: {
      label: 'GitHub',
      color: 'hsl(var(--chart-3))',
    },
    collections: {
      label: 'Collections',
      color: 'hsl(var(--chart-4))',
    },
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collections</CardTitle>
            <Library className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingCollections ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{collections.length}</div>
                <CardDescription className="text-xs text-muted-foreground">
                  {vectorizedCount} vectorized
                </CardDescription>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Processing</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingVector ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{vectorStatus?.vectorCount || 0}</div>
                <CardDescription className="text-xs text-muted-foreground">Vectors generated</CardDescription>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Keys</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingKeys ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{activeApiKeys}</div>
                <CardDescription className="text-xs text-muted-foreground">Active keys</CardDescription>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingCollections ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {
                    collections.filter((c: CollectionItem) => {
                      const lastSync = new Date(c.lastSyncTime)
                      const now = new Date()
                      const hoursSinceLastSync = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60)
                      return hoursSinceLastSync <= 24
                    }).length
                  }
                </div>
                <CardDescription className="text-xs text-muted-foreground">Updated in 24h</CardDescription>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {/* Module Growth Chart */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Content Growth</CardTitle>
            <CardDescription>Growth trends across all content types</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {isLoadingCollections ? (
              <div className="flex h-full items-center justify-center">
                <Skeleton className="h-[250px] w-full" />
              </div>
            ) : (
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="docs" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="blogs" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="github" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="collections" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Module Distribution Chart */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Content Distribution</CardTitle>
            <CardDescription>Distribution across content types</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {isLoadingCollections ? (
              <div className="flex h-full items-center justify-center">
                <Skeleton className="h-[250px] w-full" />
              </div>
            ) : (
              <div className="flex h-full flex-col">
                <ChartContainer config={chartConfig}>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <Pie
                        data={moduleData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}>
                        {moduleData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
                <div className="flex flex-wrap justify-center gap-3 px-6">
                  {moduleData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="text-xs text-muted-foreground">
                        {entry.name} ({entry.value})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
