import { format } from 'date-fns'

export const formatDate = (dateString: string | Date) => {
  const date = new Date(dateString)
  return format(date, 'MMM dd, yyyy HH:mm')
}
