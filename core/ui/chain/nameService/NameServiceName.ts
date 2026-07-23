/** Supported name service suffixes. */
export const nameServiceSuffixes = ['.thor', '.maya'] as const

export type NameServiceSuffix = (typeof nameServiceSuffixes)[number]

/**
 * Detects whether a user-typed value is a name service name (`.thor` or `.maya`).
 * Returns the matching suffix or `null` if the value is not a name service name.
 */
export const detectNameServiceSuffix = (
  value: string
): NameServiceSuffix | null => {
  const trimmed = value.trim().toLowerCase()
  return nameServiceSuffixes.find(s => trimmed.endsWith(s)) ?? null
}
