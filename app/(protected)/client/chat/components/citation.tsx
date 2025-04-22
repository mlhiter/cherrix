import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface CitationProps {
  index: number
  content: string
}

export function Citation({ index, content }: CitationProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-pointer text-blue-500 hover:text-blue-600">[citation:{index}]</span>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align="center"
          className="max-h-[200px] overflow-y-auto border border-gray-200 bg-white text-gray-700 shadow-sm">
          <p className="max-w-xs whitespace-pre-wrap p-2 text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
