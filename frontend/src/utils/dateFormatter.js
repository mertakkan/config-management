/* eslint-disable no-unused-vars */
export const formatDate = (date) => {
  if (!date) return 'N/A'

  try {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch (error) {
    console.warn('Invalid date format:', date)
    return 'Invalid Date'
  }
}

export const formatRelativeTime = (date) => {
  if (!date) return 'N/A'

  try {
    const now = new Date()
    const past = new Date(date)
    const diffMs = now - past
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays < 7) return `${diffDays} days ago`

    return formatDate(date)
  } catch (error) {
    console.warn('Invalid date format:', date)
    return 'Invalid Date'
  }
}
