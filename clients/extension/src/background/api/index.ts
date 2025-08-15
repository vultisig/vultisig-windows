import { BackgroundInterface } from '@core/inpage-provider/background/interface'
import { authorizedDapp } from './middleware/authorizedDapp'
import { BackgroundApiResolver } from './resolver'
import { getVault } from './resolvers/getVault'
import { getVaults } from './resolvers/getVaults'

type BackgroundApiImplementation = {
  [K in keyof BackgroundInterface]: BackgroundApiResolver<K>
}

export const backgroundApi: BackgroundApiImplementation = {
  getVault: authorizedDapp(getVault),
  getVaults,
}
