import {
  BackgroundInterface,
  BackgroundMethod,
} from '@core/inpage-provider/background/interface'
import { BridgeContext } from '@lib/extension/bridge/context'
import { Resolver } from '@lib/utils/types/Resolver'

export type BackgroundResolver<K extends BackgroundMethod> = Resolver<
  {
    input: BackgroundInterface[K]['input']
    context: BridgeContext
  },
  Promise<BackgroundInterface[K]['output']>
>
