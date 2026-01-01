import { callBackground } from '@core/inpage-provider/background'

export const getEthChainId = async (): Promise<string> =>
  callBackground({
    getAppChainId: { chainKind: 'evm' },
  })
