export const clampNonNegative = (x: number | null): number | null =>
  x === null ? null : Math.max(0, x)

export const fiatToBase = (
  fiat: number | null,
  price?: number
): number | null => (fiat !== null && price && price > 0 ? fiat / price : null)

export const baseToFiat = (
  base: number | null,
  price?: number
): number | null => (base !== null && price ? base * price : null)
