import { callBackground } from '@core/inpage-provider/background'

export const getEthBlockByHash = async (
  params: [`0x${string}`, boolean]
): Promise<unknown> =>
  callBackground({
    evmClientRequest: {
      method: 'eth_getBlockByHash',
      params,
    },
  })
