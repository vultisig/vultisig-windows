export const clampPercentage = (value: number) =>
  Math.min(Math.max(value, 0), 100)

export const toNumericValue = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}
