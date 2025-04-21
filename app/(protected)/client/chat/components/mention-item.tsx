interface MentionProps {
  name: string
  onClick: () => void
}

export const MentionItem = ({ name, onClick }: MentionProps) => {
  return (
    <button className="rounded px-1.5 py-0.5 hover:bg-gray-100" onClick={onClick}>
      @ {name}
    </button>
  )
}
