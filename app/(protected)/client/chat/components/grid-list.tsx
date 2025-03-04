'use client'

import { Card } from '@/components/ui/card'
import { LinkButton } from '../../components/link-button'

interface GridListProps {
  label: string
  list: {
    id: number
    name: string
  }[]
}

export const GridList = ({ label, list }: GridListProps) => {
  return (
    <div className="flex flex-col gap-8">
      <LinkButton onClick={() => {}} label={label} />
      <Card className="h-full rounded-sm bg-white p-4">
        {list.map((item) => (
          <div key={item.id}>{item.name}</div>
        ))}
      </Card>
    </div>
  )
}
