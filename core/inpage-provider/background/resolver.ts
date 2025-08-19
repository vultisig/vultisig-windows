import {
  BackgroundInterface,
  BackgroundMethod,
} from '@core/inpage-provider/background/interface'
import { BridgeContext } from '@lib/extension/bridge/context'
import { Resolver } from '@lib/utils/types/Resolver'

export type BackgroundCall<M extends BackgroundMethod> = {
  [K in M]: BackgroundInterface[K]['input']
}

export type BackgroundMessage<M extends BackgroundMethod = BackgroundMethod> = {
  call: BackgroundCall<M>
}

export type BackgroundResolver<
  K extends BackgroundMethod,
  Ctx extends BridgeContext = BridgeContext,
> = Resolver<
  {
    input: BackgroundInterface[K]['input']
    context: Ctx
  },
  Promise<BackgroundInterface[K]['output']>
>
