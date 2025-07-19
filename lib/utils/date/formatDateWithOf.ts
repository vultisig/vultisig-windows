export const formatDateWithOf = (input?: string | Date) => {
  if (!input) return ''
  const date = input instanceof Date ? input : new Date(input)
  if (isNaN(date.getTime())) return ''
  const day = date.toLocaleDateString(undefined, { day: 'numeric' })
  const month = date.toLocaleDateString(undefined, { month: 'long' })
  const year = date.toLocaleDateString(undefined, { year: 'numeric' })
  return `${day} ${month} of ${year}`
}
