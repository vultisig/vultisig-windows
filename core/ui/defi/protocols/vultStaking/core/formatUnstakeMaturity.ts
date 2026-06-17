/** Formats an unstake maturity timestamp as e.g. "11 Jun · 23:00 UTC". */
export const formatUnstakeMaturity = (maturity: number, locale?: string) => {
  const date = new Date(maturity)

  const datePart = date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })

  const timePart = date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  })

  return `${datePart} · ${timePart} UTC`
}
