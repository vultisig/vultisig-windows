import { callBackground } from '@core/inpage-provider/background'

export const getEthTransactionByHash = async (
  params: [`0x${string}`]
): Promise<any> =>
  callBackground({
    evmClientRequest: {
      method: 'eth_getTransactionByHash',
      params,
    },
  })
