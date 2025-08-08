// @antonio: Introducing these utils to avoid edge cases from parsing JSON fixtures.

export function emptyToUndefined<T>(v: T): T | undefined {
  if (v === '' || v === null || v === undefined) return undefined
  return v
}

export const bigishToString = (v: any): string | undefined => {
  if (v === null || v === undefined) return undefined
  if (typeof v === 'string') return v
  if (typeof v === 'number' && Number.isFinite(v)) return String(v)
  if (typeof v === 'bigint') return v.toString()
  return String(v)
}

export const numberOrUndefined = (v: any): number | undefined => {
  if (v === null || v === undefined || v === '') return undefined
  const n = typeof v === 'string' ? Number(v) : v
  return Number.isFinite(n) ? n : undefined
}

export const booleanOrUndefined = (v: any): boolean | undefined => {
  if (v === null || v === undefined) return undefined
  if (typeof v === 'boolean') return v
  if (v === 'true') return true
  if (v === 'false') return false
  return undefined
}
