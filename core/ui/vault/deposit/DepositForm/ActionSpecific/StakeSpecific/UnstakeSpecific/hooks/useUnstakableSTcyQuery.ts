import { cosmosRpcUrl } from '@core/chain/chains/cosmos/cosmosRpcUrl'
import { tcyAutoCompounderConfig } from '@core/chain/chains/cosmos/thor/tcy-autocompound/config'
import { queryUrl } from '@lib/utils/query/queryUrl'
import { useQuery, UseQueryOptions } from '@tanstack/react-query'

const bankApiBase = `${cosmosRpcUrl.THORChain}/cosmos/bank/v1beta1`

type BankBalanceResponse = {
  balance?: { denom?: string; amount?: string }
}

export const useUnstakableStcyQuery = ({
  address,
  options,
}: {
  address?: string | null
  options?: Partial<UseQueryOptions<bigint>>
}) =>
  useQuery({
    queryKey: ['unstakable-stcy', address],
    queryFn: async () => {
      const denom = encodeURIComponent(tcyAutoCompounderConfig.shareDenom)
      const url = `${bankApiBase}/balances/${address}/by_denom?denom=${denom}`
      const { balance } = await queryUrl<BankBalanceResponse>(url)
      return BigInt(balance?.amount ?? '0')
    },
    ...options,
  })
