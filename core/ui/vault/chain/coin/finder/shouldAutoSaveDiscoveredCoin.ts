/**
 * Determines whether a discovered coin should be automatically saved to the vault.
 * Returns `false` only when the coin is explicitly marked as hidden.
 * @param coin - The discovered coin object to evaluate.
 * @returns `true` if the coin should be auto-saved, `false` if it should be filtered out.
 */
export const shouldAutoSaveDiscoveredCoin = (coin: unknown) => {
  if (typeof coin !== 'object' || coin === null) return true
  if (!('isHidden' in coin)) return true

  return coin.isHidden !== true
}
