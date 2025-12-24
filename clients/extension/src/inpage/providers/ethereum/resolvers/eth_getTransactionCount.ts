import { callBackground } from '@core/inpage-provider/background'
import { BlockTag } from 'viem'

export const getEthTransactionCount = async ([address, at]: [
  `0x${string}`,
  BlockTag | `0x${string}` | undefined,
]): Promise<string> =>
  callBackground({
    evmClientRequest: {
      method: 'eth_getTransactionCount',
      params: [address, at ?? 'latest'],
    },
  }) as Promise<string>
