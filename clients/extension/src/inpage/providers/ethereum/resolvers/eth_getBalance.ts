import { callBackground } from '@core/inpage-provider/background'
import { BlockTag } from 'viem'

export const getEthBalance = async ([address, at]: [
  `0x${string}`,
  BlockTag | `0x${string}` | undefined,
]): Promise<string> =>
  callBackground({
    evmClientRequest: {
      method: 'eth_getBalance',
      params: [address, at ?? 'latest'],
    },
  }) as Promise<string>
