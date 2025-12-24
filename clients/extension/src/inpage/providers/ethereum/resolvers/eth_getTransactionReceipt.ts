import { callBackground } from '@core/inpage-provider/background'

import { EthereumResolver } from '../resolver'

export const getEthTransactionReceipt: EthereumResolver<
  [`0x${string}`] | [`0x${string}`, ...unknown[]],
  any
> = async params =>
  callBackground({
    evmClientRequest: {
      method: 'eth_getTransactionReceipt',
      params,
    },
  })
