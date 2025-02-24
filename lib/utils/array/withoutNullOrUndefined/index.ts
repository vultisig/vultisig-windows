export function withoutNullOrUndefined<T>(
  items: Array<T | null | undefined>
): T[] {
  return items.filter(item => item !== null && item !== undefined) as T[]
}
