import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { useQuery } from '@tanstack/react-query'
import { Chain, EvmChain } from '@vultisig/core-chain/Chain'
import { getErc721Balance } from '@vultisig/core-chain/chains/evm/erc721/getErc721Balance'
import { getCoinBalance } from '@vultisig/core-chain/coin/balance'
import { vult } from '@vultisig/core-chain/coin/knownTokens'
import { getVultDiscountTier } from '@vultisig/core-chain/swap/affiliate'
import { Address } from 'viem'

const thorguardNftAddress: Address =
  '0xa98b29a8f5a247802149c268ecf860b8308b7291'

export const useVultDiscountTierQuery = () => {
  const address = useCurrentVaultAddress(Chain.Ethereum)

  return useQuery({
    queryKey: ['vultDiscountTier', address],
    queryFn: async () => {
      const [vultBalance, thorguardNftBalance] = await Promise.all([
        getCoinBalance({ chain: vult.chain, id: vult.id, address }),
        getErc721Balance({
          chain: EvmChain.Ethereum,
          address: thorguardNftAddress,
          accountAddress: address as Address,
        }),
      ])
      return getVultDiscountTier({ vultBalance, thorguardNftBalance })
    },
    enabled: !!address,
    initialData: address ? undefined : null,
  })
}
