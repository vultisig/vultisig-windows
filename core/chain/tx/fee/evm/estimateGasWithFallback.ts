import { attempt, withFallback } from '@lib/utils/attempt'
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
  const result = await attempt(async () => {
    const client = getEvmClient(chain as EvmChain)
    const parsedValue = value ? BigInt(value) : undefined
    const gasLimit = await client.estimateGas({
      to: to as `0x${string}`,
      data: data as `0x${string}`,
      value: parsedValue && parsedValue !== 0n ? parsedValue : undefined,
      account: from as `0x${string}`,
    })
    const gasLimitNumber = Number(gasLimit)
    if (gasLimitNumber === 0) return defaultEvmSwapGasLimit
    return Math.ceil(gasLimitNumber * 1.5)
  })
  return withFallback(result, defaultEvmSwapGasLimit)
}
