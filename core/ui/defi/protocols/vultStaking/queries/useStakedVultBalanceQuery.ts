import { getBalanceQueryOptions } from '@core/ui/chain/coin/queries/useBalancesQuery'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { useTransformQueryData } from '@lib/ui/query/hooks/useTransformQueryData'
import { Query } from '@lib/ui/query/Query'
import { useQuery } from '@tanstack/react-query'
import { extractAccountCoinKey } from '@vultisig/core-chain/coin/AccountCoin'

import { sVultCoin, vultStakingChain } from '../core/config'

/** sVULT balance held by the vault — equals the amount of VULT currently staked. */
export const useStakedVultBalanceQuery = (): Query<bigint> => {
  const address = useCurrentVaultAddress(vultStakingChain)

  const balanceQuery = useQuery(
    getBalanceQueryOptions(extractAccountCoinKey({ ...sVultCoin, address }))
  )

  return useTransformQueryData(balanceQuery, data => Object.values(data)[0])
}
