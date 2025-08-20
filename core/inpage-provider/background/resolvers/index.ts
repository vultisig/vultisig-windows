import { BackgroundMethod } from '@core/inpage-provider/background/interface'
import { BackgroundResolver } from '@core/inpage-provider/background/resolver'

import { getAddress } from './getAddress'
import { getAppChain } from './getAppChain'
import { getAppChainId } from './getAppChainId'

type BackgroundResolvers = {
  [K in BackgroundMethod]: BackgroundResolver<K>
}

export const backgroundResolvers: BackgroundResolvers = {
  getAppChainId,
  getAppChain,
  getAddress,
}
