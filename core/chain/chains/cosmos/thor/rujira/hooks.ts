import { useQuery } from '@tanstack/react-query'

import { useSelectedAddress } from '../../../address/useSelectedAddress' // current bech32 addr
import { useBankBalance } from '../../bank/useBankBalance' // standard bank balance by denom
import { useCosmosQueryClient } from '../../shared/useCosmosQueryClient'
import { queryWasm } from '../../wasm/queryWasm'
import { AccountResponse, QueryMsg, rujira } from './config'

const toFloat = (u128: string, decimals: number) =>
  Number(u128) / Math.pow(10, decimals)

export function useRujiraAccount() {
  const qc = useCosmosQueryClient('THORChain')
  const addr = useSelectedAddress('THORChain')

  return useQuery({
    queryKey: ['ruji', 'account', addr],
    enabled: !!qc && !!addr,
    queryFn: async () => {
      const msg: QueryMsg = { Account: { addr: addr! } }
      return queryWasm<AccountResponse>(qc!, rujira.contract, msg)
    },
  })
}

export function useRujiraBalances() {
  const addr = useSelectedAddress('THORChain')
  const bank = useBankBalance('THORChain', addr, rujira.bondDenom)
  const account = useRujiraAccount()

  const liquidRUJI = bank.data
    ? toFloat(bank.data.amount, rujira.bondDecimals)
    : 0
  const stakedRUJI = account.data
    ? toFloat(account.data.bonded, rujira.bondDecimals)
    : 0
  const pendingRewardsUSDC = account.data
    ? toFloat(account.data.pending_revenue, rujira.revenueDecimals)
    : 0

  return {
    liquidRUJI,
    stakedRUJI,
    pendingRewardsUSDC,
    isLoading: bank.isLoading || account.isLoading,
    error: bank.error || account.error,
  }
}
