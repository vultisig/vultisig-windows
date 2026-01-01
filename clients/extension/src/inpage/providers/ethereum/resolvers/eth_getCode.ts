import { callBackground } from '@core/inpage-provider/background'
import { BlockTag } from 'viem'

export const getEthCode = async ([address, at]: [
  `0x${string}`,
  BlockTag | `0x${string}` | undefined,
]): Promise<string> =>
  callBackground({
    evmClientRequest: {
      method: 'eth_getCode',
      params: [address, at ?? 'latest'],
    },
  }) as Promise<string>
