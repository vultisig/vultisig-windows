export const formatReferralDateExpiration = (value?: string | Date) => {
  if (!value) return ''
  const d = value instanceof Date ? value : new Date(value)
  if (isNaN(d.getTime())) return ''
  return (
    `${d.toLocaleDateString(undefined, { day: 'numeric' })} ` +
    `${d.toLocaleDateString(undefined, { month: 'long' })} of ` +
    `${d.toLocaleDateString(undefined, { year: 'numeric' })}`
  )
}
