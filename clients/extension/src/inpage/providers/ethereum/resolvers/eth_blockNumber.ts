import { callBackground } from '@core/inpage-provider/background'

import { EthereumResolver } from '../resolver'

export const getEthBlockNumber: EthereumResolver<void, string> = async () =>
  callBackground({
    evmClientRequest: { method: 'eth_blockNumber' },
  }) as Promise<string>
