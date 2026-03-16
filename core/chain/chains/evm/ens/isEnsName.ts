/**
 * Returns true if the input looks like an ENS name (ends with .eth,
 * case-insensitive, and has at least one character before the dot).
 *
 * @param input - The string to test
 */
export const isEnsName = (input: string): boolean => {
  return /^.+\.eth$/i.test(input.trim())
}
