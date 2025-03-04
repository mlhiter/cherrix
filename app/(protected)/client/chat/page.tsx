import {
  mockAIInsightList,
  mockRecentCollectionList,
  mockRecentOpenList,
} from '@/mock/home'

import { GridList } from './components/grid-list'

export default function HomePage() {
  return (
    <>
      {/* slogan */}
      <div className="flex min-h-[20%] items-center justify-center text-2xl font-bold">
        I am a slogan
      </div>

      {/* list */}
      <div className="grid h-full grid-cols-3 gap-6">
        <GridList label="Recent Collection" list={mockRecentCollectionList} />
        <GridList label="AI Insight" list={mockAIInsightList} />
        <GridList label="Recent Open" list={mockRecentOpenList} />
      </div>
    </>
  )
}
