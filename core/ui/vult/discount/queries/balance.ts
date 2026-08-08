import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { useQuery } from '@tanstack/react-query'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { Chain } from '@vultisig/core-chain/Chain'
import { getCoinBalance } from '@vultisig/core-chain/coin/balance'
import { vult } from '@vultisig/core-chain/coin/knownTokens'
import { isAddress } from 'viem'

import { vultDiscountTierStaleTime } from './tier'

const vultBalanceQueryKey = (address: string) => ['vultBalance', address]

/** Resolves the VULT balance (human units) held by the current vault's Ethereum address. */
export const useVultBalanceQuery = () => {
  const address = useCurrentVaultAddress(Chain.Ethereum)

  return useQuery({
    queryKey: vultBalanceQueryKey(address),
    queryFn: async () => {
      if (!isAddress(address)) {
        return 0
      }

      const balance = await getCoinBalance({
        chain: vult.chain,
        id: vult.id,
        address,
      })

      return fromChainAmount(balance, vult.decimals)
    },
    enabled: !!address,
    placeholderData: 0,
    staleTime: vultDiscountTierStaleTime,
  })
}
