import { FileMinus, Pin } from 'lucide-react'

import { Button } from '@/components/ui/button'

export const PinList = () => {
  const mockList = [
    {
      id: 1,
      name: 'PinList',
    },
    {
      id: 2,
      name: 'PinList2',
    },
    {
      id: 3,
      name: 'PinList3',
    },
  ]

  return (
    <div className="h-full w-full rounded-sm border-gray-200 p-2">
      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          disabled
          className="w-full border-none bg-transparent shadow-none">
          <Pin />
          PinList
        </Button>
        <div className="flex flex-col gap-2">
          {mockList.map((item) => (
            <div key={item.id} className="flex min-h-6 items-center gap-2">
              <FileMinus className="h-4 w-4" />
              <div className="text-sm font-medium">{item.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
