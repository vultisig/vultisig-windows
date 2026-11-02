import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { Chain } from '@vultisig/core-chain/Chain'
import { getThorchainSecuredAssetCatalog } from '@vultisig/core-chain/chains/cosmos/thor/securedAssets'
import { KnownCoin } from '@vultisig/core-chain/coin/Coin'
import { omit } from '@vultisig/lib-utils/record/omit'

const fetchThorchainSecuredAssetCoins = async (): Promise<KnownCoin[]> => {
  const { assets } = await getThorchainSecuredAssetCatalog()

  // Catalog entries carry live pool state; only the coin fields may reach storage.
  return assets.map(asset =>
    omit(asset, 'l1Asset', 'isSecured', 'supply', 'depth')
  )
}

/**
 * THORChain secured assets from the live `/thorchain/securedassets` catalog
 * (static metadata when offline), as plain coins. Fetches only for THORChain.
 */
export const useThorchainSecuredAssetsQuery = (
  chain: Chain
): UseQueryResult<KnownCoin[]> =>
  useQuery({
    queryKey: ['thorchainSecuredAssets', chain],
    enabled: chain === Chain.THORChain,
    queryFn: fetchThorchainSecuredAssetCoins,
  })
