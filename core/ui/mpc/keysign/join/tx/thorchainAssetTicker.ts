import { findThorchainMemoAssetSeparatorIndex } from '@vultisig/core-chain/swap/native/thorchainMemoAsset'

/**
 * The ticker inside THORChain asset notation — `THOR.RUNE` → `RUNE`,
 * `ETH.USDC-06EB48` → `USDC`, secured `ETH-USDC-0xa0b8…` → `USDC`.
 *
 * The chain prefix ends at the FIRST separator of any flavour (`.`, `/`, `~`,
 * `-`), which is what makes secured assets readable at all: they spell the whole
 * denom with `-`, so looking only for a dot finds no prefix and leaves the raw
 * 40-plus character denom standing in for the ticker on every surface that
 * renders one.
 *
 * Falls back to the whole string when the notation has no chain prefix, so an
 * asset shape this doesn't anticipate still renders something truthful to a
 * co-signer rather than an empty cell.
 */
export const getThorchainAssetTicker = (asset: string): string => {
  const separatorIndex = findThorchainMemoAssetSeparatorIndex(asset)
  if (separatorIndex === -1) {
    return asset
  }

  const [ticker] = asset.slice(separatorIndex + 1).split('-')

  return ticker || asset
}
