import { Chain, EvmChain } from '../../../Chain'
import { getEvmClient } from '../../../chains/evm/client'
import { defaultEvmSwapGasLimit } from './evmGasLimit'

export const estimateEvmGasWithFallback = async ({
  chain,
  to,
  data,
  value,
}: {
  chain: Chain
  to: string
  data?: string
  value?: string
}): Promise<number> => {
  try {
    const client = getEvmClient(chain as EvmChain)
    const gasLimit = await client.estimateGas({
      to: to as `0x${string}`,
      data: data as `0x${string}`,
      value: value ? BigInt(value) : undefined,
    })
    const gasLimitNumber = Number(gasLimit)
    return gasLimitNumber === 0 ? defaultEvmSwapGasLimit : gasLimitNumber
  } catch (error) {
    console.warn('Failed to estimate gas, using default:', error)
    return defaultEvmSwapGasLimit
  }
}
