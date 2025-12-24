import { callBackground } from '@core/inpage-provider/background'

import { EthereumResolver } from '../resolver'

export const getEthChainId: EthereumResolver<void, string> = async () =>
  callBackground({
    getAppChainId: { chainKind: 'evm' },
  })
