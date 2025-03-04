interface HeaderProps {
  title: string
  description?: string
}

export const Header = ({ title, description }: HeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">{title}</h1>
      {description && <p className="text-sm text-gray-500">{description}</p>}
    </div>
  )
}
