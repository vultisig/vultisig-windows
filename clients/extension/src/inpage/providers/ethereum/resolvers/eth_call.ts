import { callBackground } from '@core/inpage-provider/background'
import { BlockTag, type RpcTransactionRequest } from 'viem'

import { EthereumResolver } from '../resolver'

export const callEth: EthereumResolver<
  [RpcTransactionRequest, BlockTag | `0x${string}` | undefined],
  string
> = async params =>
  callBackground({
    evmClientRequest: { method: 'eth_call', params },
  }) as Promise<string>
