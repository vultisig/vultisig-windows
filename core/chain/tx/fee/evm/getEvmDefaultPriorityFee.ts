import { EvmChain } from '@core/chain/Chain'
import { getEvmClient } from '@core/chain/chains/evm/client'

export const getEvmDefaultPriorityFee = async (
  chain: EvmChain
): Promise<number> => {
  const publicClient = getEvmClient(chain)

  try {
    const maxPriorityFeePerGas =
      await publicClient.estimateMaxPriorityFeePerGas()
    return Number(maxPriorityFeePerGas)
  } catch (error) {
    console.warn(
      `Failed to fetch priority fee for ${chain}, using fallback:`,
      error
    )
    return 1000000000 // 1 gwei
  }
}
