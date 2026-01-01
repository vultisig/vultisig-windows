import { callBackground } from '@core/inpage-provider/background'
import { BlockTag, type RpcTransactionRequest } from 'viem'

export const callEth = async (
  params: [RpcTransactionRequest, BlockTag | `0x${string}` | undefined]
): Promise<string> =>
  callBackground({
    evmClientRequest: { method: 'eth_call', params },
  }) as Promise<string>
