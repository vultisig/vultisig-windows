import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { cosmosRpcUrl } from '@vultisig/core-chain/chains/cosmos/cosmosRpcUrl'
import { bruneBondConfig } from '@vultisig/core-chain/chains/cosmos/thor/brune-bond/config'
import { queryUrl } from '@vultisig/lib-utils/query/queryUrl'

const bankApiBase = `${cosmosRpcUrl.THORChain}/cosmos/bank/v1beta1`

type BankBalanceResponse = {
  balance?: { denom?: string; amount?: string }
}

export const useUnstakableBruneQuery = ({
  address,
  options,
}: {
  address?: string | null
  options?: Partial<UseQueryOptions<bigint>>
}) =>
  useQuery({
    queryKey: ['unstakable-brune', address],
    queryFn: async () => {
      const denom = encodeURIComponent(bruneBondConfig.shareDenom)
      const url = `${bankApiBase}/balances/${address}/by_denom?denom=${denom}`
      const { balance } = await queryUrl<BankBalanceResponse>(url)
      return BigInt(balance?.amount ?? '0')
    },
    ...options,
    select: (data = 0n) => ({
      chainBalance: data,
      humanReadableBalance: fromChainAmount(
        data,
        bruneBondConfig.shareDecimals
      ),
    }),
  })
