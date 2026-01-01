import { callBackground } from '@core/inpage-provider/background'
import { BlockTag, type RpcTransactionRequest } from 'viem'

export const estimateEthGas = async (
  params: [RpcTransactionRequest, BlockTag | `0x${string}` | undefined]
): Promise<string> =>
  callBackground({
    evmClientRequest: { method: 'eth_estimateGas', params },
  }) as Promise<string>
