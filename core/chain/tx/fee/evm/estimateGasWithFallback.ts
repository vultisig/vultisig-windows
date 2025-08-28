import { Chain, EvmChain } from '../../../Chain'
import { getEvmClient } from '../../../chains/evm/client'
import { defaultEvmSwapGasLimit } from './evmGasLimit'

export const estimateEvmGasWithFallback = async ({
  chain,
  from,
  to,
  data,
  value,
}: {
  chain: Chain
  from: string
  to: string
  data?: string
  value?: string
}): Promise<number> => {
  try {
    const client = getEvmClient(chain as EvmChain)
    const gasLimit = await client.estimateGas({
      to: to as `0x${string}`,
      data: data as `0x${string}`,
      value: value && Number(value) !== 0 ? BigInt(value) : undefined,
      account: from as `0x${string}`,
    })
    const gasLimitNumber = Number(gasLimit)
    return gasLimitNumber === 0 ? defaultEvmSwapGasLimit : gasLimitNumber
  } catch (error) {
    console.warn('Failed to estimate gas, using default:', error)
    return defaultEvmSwapGasLimit
  }
}
