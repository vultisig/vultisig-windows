import { callBackground } from '@core/inpage-provider/background'
import { BlockTag } from 'viem'

import { EthereumResolver } from '../resolver'

export const getEthCode: EthereumResolver<
  [`0x${string}`, BlockTag | `0x${string}` | undefined],
  string
> = async ([address, at]) =>
  callBackground({
    evmClientRequest: {
      method: 'eth_getCode',
      params: [address, at ?? 'latest'],
    },
  }) as Promise<string>
