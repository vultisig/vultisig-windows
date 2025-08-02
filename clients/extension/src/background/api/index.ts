import { BackgroundApiInterface } from './interface'
import { BackgroundApiResolver } from './resolver'
import { getVault } from './resolvers/getVault'

type BackgroundApiImplementation = {
  [K in keyof BackgroundApiInterface]: BackgroundApiResolver<K>
}

export const backgroundApi: BackgroundApiImplementation = {
  getVault,
}
