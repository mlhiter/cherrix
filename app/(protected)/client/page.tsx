'use client'

import { Sidebar } from './components/sidebar'
import { LinkButton } from './components/link-button'
import { GridList } from './components/grid-list'

const ClientPage = () => {
  const mockRecentOpenList = [
    {
      id: 1,
      name: 'test1',
    },
    {
      id: 2,
      name: 'test2',
    },
    {
      id: 3,
      name: 'test3',
    },
  ]
  const mockRecentCollectionList = [
    {
      id: 1,
      name: 'test1',
    },
    {
      id: 2,
      name: 'test2',
    },
    {
      id: 3,
      name: 'test3',
    },
  ]
  const mockAIInsightList = [
    {
      id: 1,
      name: 'test1',
    },
    {
      id: 2,
      name: 'test2',
    },
    {
      id: 3,
      name: 'test3',
    },
  ]
  return (
    <div className="flex h-screen w-full bg-white p-4">
      <div className="flex w-full gap-6">
        <Sidebar />

        <main className="flex flex-1 flex-col border-x p-4">
          {/* slogan */}
          <div className="flex min-h-[20%] items-center justify-center text-2xl font-bold">
            I am a slogan
          </div>

          {/* list */}
          <div className="grid h-full grid-cols-3 gap-6">
            <GridList
              label="Recent Collection"
              list={mockRecentCollectionList}
            />
            <GridList label="AI Insight" list={mockAIInsightList} />
            <GridList label="Recent Open" list={mockRecentOpenList} />
          </div>
        </main>
      </div>
    </div>
  )
}

export default ClientPage
