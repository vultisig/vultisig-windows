import { callBackground } from '@core/inpage-provider/background'

export const getEthMaxPriorityFeePerGas = async (): Promise<string> =>
  callBackground({
    evmClientRequest: { method: 'eth_maxPriorityFeePerGas' },
  }) as Promise<string>
