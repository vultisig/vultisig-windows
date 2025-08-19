import { BackgroundMethod } from '@core/inpage-provider/background/interface'
import { BackgroundResolver } from '@core/inpage-provider/background/resolver'

import { getAddress } from './getAddress'
import { getAppChain } from './getAppChain'
import { getAppChainId } from './getAppChainId'
import { getVaults } from './getVaults'

type BackgroundResolvers = {
  [K in BackgroundMethod]: BackgroundResolver<K>
}

export const backgroundResolvers: BackgroundResolvers = {
  getVaults,
  getAppChainId,
  getAppChain,
  getAddress,
}
