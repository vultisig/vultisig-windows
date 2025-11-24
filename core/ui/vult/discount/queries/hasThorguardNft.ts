import { EvmChain } from '@core/chain/Chain'
import { getChainKind } from '@core/chain/ChainKind'
import { vult } from '@core/chain/coin/knownTokens'
import { hasThorguardNft } from '@core/chain/swap/affiliate/thorguard'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { useQuery } from '@tanstack/react-query'

export const useHasThorguardNftQuery = () => {
  const address = useCurrentVaultAddress(vult.chain)

  return useQuery({
    queryKey: ['hasThorguardNft', vult.chain, address],
    queryFn: async () => {
      const chainKind = getChainKind(vult.chain)
      if (chainKind !== 'evm') {
        return false
      }

      return hasThorguardNft({
        chain: vult.chain as EvmChain,
        address: address as `0x${string}`,
      })
    },
    enabled: !!address,
  })
}
