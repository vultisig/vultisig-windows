const maxTitleLength = 50

export const generateChatTitle = (message: string): string => {
  const cleaned = message.replace(/\s+/g, ' ').trim()

  if (cleaned.length <= maxTitleLength) {
    return cleaned
  }

  const truncated = cleaned.slice(0, maxTitleLength)
  const lastSpace = truncated.lastIndexOf(' ')

  if (lastSpace > maxTitleLength * 0.6) {
    return truncated.slice(0, lastSpace) + '...'
  }

  return truncated + '...'
}
