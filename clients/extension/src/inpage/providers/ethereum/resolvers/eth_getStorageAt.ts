import { callBackground } from '@core/inpage-provider/background'
import { BlockTag } from 'viem'

export const getEthStorageAt = async ([address, position, at]: [
  `0x${string}`,
  `0x${string}`,
  BlockTag | `0x${string}` | undefined,
]): Promise<string> =>
  callBackground({
    evmClientRequest: {
      method: 'eth_getStorageAt',
      params: [address, position, at ?? 'latest'],
    },
  }) as Promise<string>
