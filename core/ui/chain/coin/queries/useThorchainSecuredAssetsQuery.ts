import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { Chain } from '@vultisig/core-chain/Chain'
import { cosmosRpcUrl } from '@vultisig/core-chain/chains/cosmos/cosmosRpcUrl'
import { getThorchainSecuredAssetCatalog } from '@vultisig/core-chain/chains/cosmos/thor/securedAssets'
import { KnownCoin } from '@vultisig/core-chain/coin/Coin'
import { queryUrl } from '@vultisig/lib-utils/query/queryUrl'
import { omit } from '@vultisig/lib-utils/record/omit'

type ThorchainPoolStatus = {
  asset: string
  status: string
}

const getAvailablePoolAssets = async (): Promise<Set<string>> => {
  const pools = await queryUrl<ThorchainPoolStatus[]>(
    `${cosmosRpcUrl.THORChain}/thorchain/pools`
  )

  return new Set(
    pools
      .filter(({ status }) => status.toLowerCase() === 'available')
      .map(({ asset }) => asset.toUpperCase())
  )
}

const fetchThorchainSecuredAssetCoins = async (): Promise<KnownCoin[]> => {
  const [{ assets }, availablePoolAssets] = await Promise.all([
    getThorchainSecuredAssetCatalog(),
    getAvailablePoolAssets(),
  ])

  // Catalog entries carry live pool state; only the coin fields may reach storage.
  return assets
    .filter(({ l1Asset }) => availablePoolAssets.has(l1Asset))
    .map(asset => omit(asset, 'l1Asset', 'isSecured', 'supply', 'depth'))
}

/**
 * THORChain secured assets whose pool is Available, as plain coins: the live
 * `/thorchain/securedassets` catalog (static metadata when offline) filtered
 * by THORNode's Available pools. Errors when the pools can't be read, so an
 * unfiltered list is never offered. Fetches only for THORChain.
 */
export const useThorchainSecuredAssetsQuery = (
  chain: Chain
): UseQueryResult<KnownCoin[]> =>
  useQuery({
    queryKey: ['thorchainSecuredAssets', chain],
    enabled: chain === Chain.THORChain,
    queryFn: fetchThorchainSecuredAssetCoins,
  })
