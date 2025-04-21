import { CardWrapper } from './card-wrapper'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'

export const ErrorCard = () => {
  return (
    <CardWrapper headerLabel="Oops! Something went wrong!" backButtonLabel="Back to login" backButtonHref="/auth/login">
      <div className="flex w-full items-center justify-center">
        <ExclamationTriangleIcon className="text-destructive" />
      </div>
    </CardWrapper>
  )
}
