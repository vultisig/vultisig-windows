import { BackgroundApiInterface } from './interface'
import { authorizedDapp } from './middleware/authorizedDapp'
import { BackgroundApiResolver } from './resolver'
import { getVault } from './resolvers/getVault'

type BackgroundApiImplementation = {
  [K in keyof BackgroundApiInterface]: BackgroundApiResolver<K>
}

export const backgroundApi: BackgroundApiImplementation = {
  getVault: authorizedDapp(getVault),
}
