/**
 * Keeps SDK-hidden discoveries out of the persisted visible vault coin list.
 */
export const shouldAutoSaveDiscoveredCoin = (coin: unknown) => {
  if (typeof coin !== 'object' || coin === null) return true
  if (!('isHidden' in coin)) return true

  return coin.isHidden !== true
}
