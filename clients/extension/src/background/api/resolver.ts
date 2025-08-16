import { BridgeContext } from '@core/inpage-provider/bridge/context'
import { Resolver } from '@lib/utils/types/Resolver'

import { BackgroundApiInterface } from './interface'

export type BackgroundApiResolver<K extends keyof BackgroundApiInterface> =
  Resolver<
    {
      input: BackgroundApiInterface[K]['input']
      context: BridgeContext
    },
    Promise<BackgroundApiInterface[K]['output']>
  >
