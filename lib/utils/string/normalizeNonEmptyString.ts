export const normalizeNonEmptyString = (
  value?: string | null
): string | undefined => {
  if (value === undefined || value === null) {
    return undefined
  }

  return value.trim() === '' ? undefined : value
}
