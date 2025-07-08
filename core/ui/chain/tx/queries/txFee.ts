import { Chain, EvmChain } from '@core/chain/Chain'
import { getEvmClient } from '@core/chain/chains/evm/client'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { NotImplementedError } from '@lib/utils/error/NotImplementedError'
import { useQuery } from '@tanstack/react-query'

type UseTxFeeQueryInput = {
  txHash: string
  chain: Chain
}

export const useTxFeeQuery = (input: UseTxFeeQueryInput) => {
  const { txHash, chain } = input

  return useQuery({
    queryKey: ['txFee', input],
    queryFn: async () => {
      if (!isOneOf(chain, Object.values(EvmChain))) {
        throw new NotImplementedError('Tx fee query for non-EVM chains')
      }
      const client = getEvmClient(chain)
      const { gasUsed, effectiveGasPrice } = await client.getTransactionReceipt(
        {
          hash: txHash as `0x${string}`,
        }
      )

      return gasUsed * effectiveGasPrice
    },
  })
}
