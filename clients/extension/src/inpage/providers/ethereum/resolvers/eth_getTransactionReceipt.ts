import { callBackground } from '@core/inpage-provider/background'

export const getEthTransactionReceipt = async (
  params: [`0x${string}`] | [`0x${string}`, ...unknown[]]
): Promise<any> =>
  callBackground({
    evmClientRequest: {
      method: 'eth_getTransactionReceipt',
      params,
    },
  })
