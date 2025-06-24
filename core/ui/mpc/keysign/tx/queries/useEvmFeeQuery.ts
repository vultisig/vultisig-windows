import { EvmChain } from '@core/chain/Chain'
import { getEvmClient } from '@core/chain/chains/evm/client'
import { useQuery } from '@tanstack/react-query'

type UseEvmFeeQueryInput = {
  txHash: string
  chain: EvmChain
}

export const useEvmFeeQuery = (input: UseEvmFeeQueryInput) => {
  const { txHash, chain } = input
  return useQuery({
    queryKey: ['evmFee', input],
    queryFn: async () => {
      const client = getEvmClient(chain)
      const receipt = await client.getTransactionReceipt({
        hash: txHash as `0x${string}`,
      })

      if (!receipt || !receipt.gasUsed || !receipt.effectiveGasPrice) {
        throw new Error('Transaction receipt not found or incomplete')
      }

      return BigInt(receipt.gasUsed) * BigInt(receipt.effectiveGasPrice)
    },
  })
}
