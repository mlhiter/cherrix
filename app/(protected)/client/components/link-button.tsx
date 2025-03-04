import { Button } from '@/components/ui/button'

export const LinkButton = ({
  onClick,
  label,
  icon,
}: {
  onClick: () => void
  label?: string
  icon?: React.ReactNode
}) => {
  return (
    <Button
      className="w-full min-w-fit bg-white text-sm text-black hover:bg-gray-100"
      onClick={onClick}>
      {icon}
      {label}
    </Button>
  )
}
