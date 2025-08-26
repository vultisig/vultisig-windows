import {
  authorizedBackgroundMethods,
  BackgroundInterface,
  BackgroundMethod,
} from '@core/inpage-provider/background/interface'
import { BridgeContext } from '@lib/extension/bridge/context'
import { Resolver } from '@lib/utils/types/Resolver'

import type { AuthorizedContext } from './core/authorization'

export type BackgroundCall<M extends BackgroundMethod> = {
  [K in M]: BackgroundInterface[K]['input']
}

export type BackgroundMessage<M extends BackgroundMethod = BackgroundMethod> = {
  call: BackgroundCall<M>
  options?: { account?: string }
}

type AuthorizedBackgroundMethod = (typeof authorizedBackgroundMethods)[number]

export type BackgroundResolver<K extends BackgroundMethod> = Resolver<
  {
    input: BackgroundInterface[K]['input']
    context: K extends AuthorizedBackgroundMethod
      ? AuthorizedContext
      : BridgeContext
  },
  Promise<BackgroundInterface[K]['output']>
>
