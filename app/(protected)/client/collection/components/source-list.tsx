import { Card } from '@/components/ui/card'

import { CollectionSource } from '@/types/collection'

const sources: CollectionSource[] = [
  {
    type: 'OFFICIAL_DOC',
    name: 'Official Document',
    description: 'Collect content from official documents',
    icon: '📚',
  },
  {
    type: 'RSS_BLOG',
    name: 'RSS Blog',
    description: 'Collect content from RSS sources',
    icon: '📰',
  },
  {
    type: 'GITHUB',
    name: 'Github',
    description: 'Collect content from Github repositories',
    icon: '🐙',
  },
]

interface SourceListProps {
  onSourceSelect: (source: CollectionSource) => void
}

export function SourceList({ onSourceSelect }: SourceListProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {sources.map((source) => (
        <Card
          key={source.type}
          className="flex cursor-pointer flex-col items-center gap-2 p-4 hover:bg-accent"
          onClick={() => onSourceSelect(source)}>
          <div className="text-4xl">{source.icon}</div>
          <div className="font-medium">{source.name}</div>
          <div className="text-sm text-muted-foreground">
            {source.description}
          </div>
        </Card>
      ))}
    </div>
  )
}
