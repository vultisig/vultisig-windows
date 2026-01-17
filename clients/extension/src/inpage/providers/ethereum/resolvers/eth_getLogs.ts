import { callBackground } from '@core/inpage-provider/background'
import { BlockTag } from 'viem'

type LogsFilter = {
  address?: `0x${string}` | `0x${string}`[]
  topics?: (`0x${string}` | `0x${string}`[] | null)[]
  fromBlock?: BlockTag | `0x${string}`
  toBlock?: BlockTag | `0x${string}`
  blockHash?: `0x${string}`
}

export const getEthLogs = async (params: [LogsFilter]): Promise<unknown[]> =>
  callBackground({
    evmClientRequest: {
      method: 'eth_getLogs',
      params,
    },
  }) as Promise<unknown[]>
