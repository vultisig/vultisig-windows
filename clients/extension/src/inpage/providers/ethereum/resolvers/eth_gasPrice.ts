import { callBackground } from '@core/inpage-provider/background'

import { EthereumResolver } from '../resolver'

export const getEthGasPrice: EthereumResolver<void, string> = async () =>
  callBackground({
    evmClientRequest: { method: 'eth_gasPrice' },
  }) as Promise<string>
