import { callBackground } from '@core/inpage-provider/background'

export const getEthBlockNumber = async (): Promise<string> =>
  callBackground({
    evmClientRequest: { method: 'eth_blockNumber' },
  }) as Promise<string>
