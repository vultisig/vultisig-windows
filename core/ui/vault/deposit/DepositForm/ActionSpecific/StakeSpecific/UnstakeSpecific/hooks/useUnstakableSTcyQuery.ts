import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { cosmosRpcUrl } from '@vultisig/core-chain/chains/cosmos/cosmosRpcUrl'
import { tcyAutoCompounderConfig } from '@vultisig/core-chain/chains/cosmos/thor/tcy-autocompound/config'
import { knownCosmosTokens } from '@vultisig/core-chain/coin/knownTokens/cosmos'
import { queryUrl } from '@vultisig/lib-utils/query/queryUrl'

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
    select: (data = 0n) => ({
      chainBalance: data,
      humanReadableBalance: fromChainAmount(
        data,
        knownCosmosTokens.THORChain['x/staking-tcy'].decimals
      ),
    }),
  })
