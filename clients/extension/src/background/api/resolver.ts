import { BridgeContext } from '@core/inpage-provider/bridge/context'

import { BackgroundApiInterface } from './interface'

export type BackgroundApiResolverParams<
  K extends keyof BackgroundApiInterface,
> = {
  input: BackgroundApiInterface[K]['input']
  context: BridgeContext
}

export type BackgroundApiResolver<K extends keyof BackgroundApiInterface> = (
  params: BackgroundApiResolverParams<K>
) => Promise<BackgroundApiInterface[K]['output']>
