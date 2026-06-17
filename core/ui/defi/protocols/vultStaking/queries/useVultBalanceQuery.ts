import { getBalanceQueryOptions } from '@core/ui/chain/coin/queries/useBalancesQuery'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { useTransformQueryData } from '@lib/ui/query/hooks/useTransformQueryData'
import { Query } from '@lib/ui/query/Query'
import { useQuery } from '@tanstack/react-query'
import { extractAccountCoinKey } from '@vultisig/core-chain/coin/AccountCoin'

import { vultCoin, vultStakingChain } from '../core/config'

/** Available (unstaked) VULT balance held by the vault — the stake form ceiling. */
export const useVultBalanceQuery = (): Query<bigint> => {
  const address = useCurrentVaultAddress(vultStakingChain)

  const balanceQuery = useQuery(
    getBalanceQueryOptions(extractAccountCoinKey({ ...vultCoin, address }))
  )

  return useTransformQueryData(balanceQuery, data => Object.values(data)[0])
}
