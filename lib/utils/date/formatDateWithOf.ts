export const formatDateWithOf = (date: Date) => {
  const day = date.toLocaleDateString(undefined, { day: 'numeric' })
  const month = date.toLocaleDateString(undefined, { month: 'long' })
  const year = date.toLocaleDateString(undefined, { year: 'numeric' })

  return `${day} ${month} of ${year}`
}
