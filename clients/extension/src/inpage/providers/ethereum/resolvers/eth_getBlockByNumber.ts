import { callBackground } from '@core/inpage-provider/background'
import { BlockTag } from 'viem'

export const getEthBlockByNumber = async (
  params: [BlockTag | `0x${string}`, boolean]
): Promise<any> =>
  callBackground({
    evmClientRequest: {
      method: 'eth_getBlockByNumber',
      params,
    },
  })
