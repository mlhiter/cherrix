import { ExclamationTriangleIcon } from '@radix-ui/react-icons'

interface FormErrorProps {
  message: string
}

export const FormError = ({ message }: FormErrorProps) => {
  return (
    <div className="flex items-center gap-2 gap-x-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
      <ExclamationTriangleIcon className="h-4 w-4" />
      <p>{message}</p>
    </div>
  )
}
