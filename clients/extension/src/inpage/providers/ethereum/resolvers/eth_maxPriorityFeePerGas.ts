import { callBackground } from '@core/inpage-provider/background'

import { EthereumResolver } from '../resolver'

export const getEthMaxPriorityFeePerGas: EthereumResolver<
  void,
  string
> = async () =>
  callBackground({
    evmClientRequest: { method: 'eth_maxPriorityFeePerGas' },
  }) as Promise<string>
