import { callBackground } from '@core/inpage-provider/background'
import { BlockTag } from 'viem'

import { EthereumResolver } from '../resolver'

export const getEthBlockByNumber: EthereumResolver<
  [BlockTag | `0x${string}`, boolean],
  any
> = async params =>
  callBackground({
    evmClientRequest: {
      method: 'eth_getBlockByNumber',
      params,
    },
  })
