/**
 * The ticker inside THORChain asset notation — `THOR.RUNE` → `RUNE`,
 * `ETH.USDC-06EB48` → `USDC`.
 *
 * Falls back to the whole string when the notation has no chain prefix, so an
 * asset shape this doesn't anticipate still renders something truthful to a
 * co-signer rather than an empty cell.
 */
export const getThorchainAssetTicker = (asset: string): string => {
  const [, symbol] = asset.split('.')

  return symbol ? symbol.split('-')[0] : asset
}
