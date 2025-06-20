import { EvmChain } from '@core/chain/Chain'
import { getEvmClient } from '@core/chain/chains/evm/client'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { useQuery } from '@tanstack/react-query'
import { formatUnits } from 'ethers'

type UseActualFeeQueryInput = {
  txHash: string
  chain: string
  decimals: number
}

export const useActualFeeQuery = ({
  txHash,
  chain,
  decimals,
}: UseActualFeeQueryInput) => {
  return useQuery({
    queryKey: ['actualFee', txHash, chain, decimals],
    queryFn: async () => {
      const client = getEvmClient(chain as EvmChain)
      const receipt = await client.getTransactionReceipt({
        hash: txHash as `0x${string}`,
      })

      if (!receipt || !receipt.gasUsed || !receipt.effectiveGasPrice) {
        throw new Error('Transaction receipt not found or incomplete')
      }

      const actualFeeBigInt =
        BigInt(receipt.gasUsed) * BigInt(receipt.effectiveGasPrice)

      return formatUnits(actualFeeBigInt, decimals)
    },
    enabled: isOneOf(chain, Object.values(EvmChain)) && !!txHash,
  })
}
