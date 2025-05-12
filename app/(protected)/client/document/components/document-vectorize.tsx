import { toast } from 'sonner'
import { useState } from 'react'
import { Loader2, Database } from 'lucide-react'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { MyDocument } from '@/types/document'

interface DocumentVectorizeProps {
  document: MyDocument
  displayAsBadge?: boolean
}

export function DocumentVectorize({ document, displayAsBadge = false }: DocumentVectorizeProps) {
  const [isVectorizing, setIsVectorizing] = useState(false)
  const [isVectorized, setIsVectorized] = useState(document.isVectorized || false)

  const handleVectorize = async () => {
    try {
      setIsVectorizing(true)

      console.log(document)

      const response = await fetch('/api/document/vectorize', {
        method: 'POST',
        body: JSON.stringify({
          filePath: document.path,
          fileName: document.name,
          fileType: document.type,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to vectorize document')
      }

      const data = await response.json()
      setIsVectorized(true)
      toast.success(`Document vectorized with ${data.chunks} chunks`)
    } catch (error) {
      console.error('Error vectorizing document:', error)
      toast.error('Failed to vectorize document')
    } finally {
      setIsVectorizing(false)
    }
  }

  if (displayAsBadge) {
    return (
      <Badge
        variant={isVectorized ? 'success' : 'secondary'}
        className="cursor-pointer"
        onClick={(e) => {
          e.stopPropagation()
          if (!isVectorized && !isVectorizing) {
            handleVectorize()
          }
        }}>
        {isVectorizing ? (
          <>
            <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Vectorizing
          </>
        ) : isVectorized ? (
          <>
            <Database className="mr-1 h-3 w-3" /> Vectorized
          </>
        ) : (
          <>
            <Database className="mr-1 h-3 w-3" /> Vectorize
          </>
        )}
      </Badge>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleVectorize()
            }}
            disabled={isVectorizing || isVectorized}>
            {isVectorizing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isVectorized ? (
              <Database className="h-4 w-4 text-green-500" />
            ) : (
              <Database className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isVectorizing ? 'Vectorizing...' : isVectorized ? 'Document vectorized' : 'Vectorize document'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
