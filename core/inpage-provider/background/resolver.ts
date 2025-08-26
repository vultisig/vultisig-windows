import {
  AuthorizedBackgroundMethod,
  BackgroundInterface,
  BackgroundMethod,
} from '@core/inpage-provider/background/interface'
import { Resolver } from '@lib/utils/types/Resolver'

import { AuthorizedCallContext, UnauthorizedCallContext } from '../call/context'

export type BackgroundCall<M extends BackgroundMethod> = {
  [K in M]: BackgroundInterface[K]['input']
}

export type BackgroundMessage<M extends BackgroundMethod = BackgroundMethod> = {
  call: BackgroundCall<M>
  options?: { account?: string }
}

export type BackgroundResolver<K extends BackgroundMethod> = Resolver<
  {
    input: BackgroundInterface[K]['input']
    context: K extends AuthorizedBackgroundMethod
      ? AuthorizedCallContext
      : UnauthorizedCallContext
  },
  Promise<BackgroundInterface[K]['output']>
>
