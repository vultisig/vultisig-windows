import { BackgroundMethod } from '@core/inpage-provider/background/interface'
import { BackgroundResolver } from '@core/inpage-provider/background/resolver'

import { getAppChainId } from './getAppChainId'
import { getVault } from './getVault'
import { getVaults } from './getVaults'

type BackgroundResolvers = {
  [K in BackgroundMethod]: BackgroundResolver<K>
}

export const backgroundResolvers: BackgroundResolvers = {
  getVault,
  getVaults,
  getAppChainId,
}
