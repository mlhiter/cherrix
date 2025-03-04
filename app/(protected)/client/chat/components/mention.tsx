import { MentionItem } from './mention-item'

export const Mention = () => {
  return (
    <div className="flex flex-wrap gap-2 text-sm text-gray-500">
      <MentionItem name="Document" onClick={() => {}} />
      <MentionItem name="Note" onClick={() => {}} />
      <MentionItem name="Collection" onClick={() => {}} />
      <MentionItem name="Web" onClick={() => {}} />
      <MentionItem name="All Database" onClick={() => {}} />
      <MentionItem name="Other Chat" onClick={() => {}} />
    </div>
  )
}
