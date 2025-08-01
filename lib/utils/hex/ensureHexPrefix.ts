export const ensureHexPrefix = (hex: string): `0x${string}` => {
  if (hex.startsWith('0x')) {
    return hex as `0x${string}`
  }

  return `0x${hex}`
}
