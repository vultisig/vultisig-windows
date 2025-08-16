import { BackgroundMethod } from '@core/inpage-provider/background/interface'
import { BackgroundResolver } from '@core/inpage-provider/background/resolver'

import { authorizedDapp } from '../middleware/authorizedDapp'
import { getVault } from './getVault'
import { getVaults } from './getVaults'

type BackgroundResolvers = {
  [K in BackgroundMethod]: BackgroundResolver<K>
}

export const backgroundResolvers: BackgroundResolvers = {
  getVault: authorizedDapp(getVault),
  getVaults,
}
