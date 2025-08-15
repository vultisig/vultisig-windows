import { BackgroundInterface } from '@core/inpage-provider/background/interface'
import { BridgeContext } from '@core/inpage-provider/bridge/context'
import { Resolver } from '@lib/utils/types/Resolver'

export type BackgroundApiResolver<K extends keyof BackgroundInterface> =
  Resolver<
    {
      input: BackgroundInterface[K]['input']
      context: BridgeContext
    },
    Promise<BackgroundInterface[K]['output']>
  >
