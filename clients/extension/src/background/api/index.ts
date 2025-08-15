import { BackgroundMethod } from '@core/inpage-provider/background/interface'
import { BackgroundResolver } from '@core/inpage-provider/background/resolver'

import { authorizedDapp } from './middleware/authorizedDapp'
import { getVault } from './resolvers/getVault'
import { getVaults } from './resolvers/getVaults'

type BackgroundApiImplementation = {
  [K in BackgroundMethod]: BackgroundResolver<K>
}

export const backgroundApi: BackgroundApiImplementation = {
  getVault: authorizedDapp(getVault),
  getVaults,
}
