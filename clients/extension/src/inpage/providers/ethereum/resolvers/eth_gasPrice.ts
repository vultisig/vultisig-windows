import { callBackground } from '@core/inpage-provider/background'

export const getEthGasPrice = async (): Promise<string> =>
  callBackground({
    evmClientRequest: { method: 'eth_gasPrice' },
  }) as Promise<string>
