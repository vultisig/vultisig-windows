import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { Chain } from '@vultisig/core-chain/Chain'
import { getThorchainPools } from '@vultisig/core-chain/chains/cosmos/thor/lp/pools'
import { getThorchainSecuredAssetCatalog } from '@vultisig/core-chain/chains/cosmos/thor/securedAssets'
import { KnownCoin } from '@vultisig/core-chain/coin/Coin'
import { omit } from '@vultisig/lib-utils/record/omit'

import { securedAssetDenomToPoolAsset } from '../price/thor/getThorchainSecuredAssetPrices'

const fetchThorchainSecuredAssetCoins = async (): Promise<KnownCoin[]> => {
  const [{ assets }, availablePools] = await Promise.all([
    getThorchainSecuredAssetCatalog(),
    getThorchainPools(),
  ])

  const availablePoolAssets = new Set(
    availablePools.map(({ asset }) => asset.toUpperCase())
  )

  // Catalog entries carry live pool state; only the coin fields may reach storage.
  return assets
    .filter(({ id }) =>
      availablePoolAssets.has(securedAssetDenomToPoolAsset(id))
    )
    .map(asset => omit(asset, 'l1Asset', 'isSecured', 'supply', 'depth'))
}

/**
 * THORChain secured assets whose pool is Available, as plain coins: the live
 * `/thorchain/securedassets` catalog (static metadata when offline) filtered
 * by Midgard's Available pools. Errors when the pools can't be read, so an
 * unfiltered list is never offered. Fetches only for THORChain.
 */
export const useThorchainSecuredAssetsQuery = (
  chain: Chain
): UseQueryResult<KnownCoin[]> =>
  useQuery({
    queryKey: ['thorchainSecuredAssets'],
    enabled: chain === Chain.THORChain,
    queryFn: fetchThorchainSecuredAssetCoins,
  })
