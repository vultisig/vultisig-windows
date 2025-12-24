import { callBackground } from '@core/inpage-provider/background'

import { EthereumResolver } from '../resolver'

export const getEthTransactionByHash: EthereumResolver<
  [`0x${string}`],
  any
> = async params =>
  callBackground({
    evmClientRequest: {
      method: 'eth_getTransactionByHash',
      params,
    },
  })
