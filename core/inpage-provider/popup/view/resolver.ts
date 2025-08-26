import {
  authorizedMethods,
  PopupInterface,
  PopupMethod,
} from '@core/inpage-provider/popup/interface'
import { BridgeContext } from '@lib/extension/bridge/context'
import { OnFinishProp } from '@lib/ui/props'
import { Resolver } from '@lib/utils/types/Resolver'
import { Result } from '@lib/utils/types/Result'
import { ReactNode } from 'react'

import { AuthorizedContext } from '../../background/core/authorization'

export type PopupResolver<K extends PopupMethod> = Resolver<
  {
    input: PopupInterface[K]['input']
  } & OnFinishProp<Result<PopupInterface[K]['output']>> &
    (K extends (typeof authorizedMethods)[number]
      ? { context: AuthorizedContext }
      : { context?: BridgeContext }),
  ReactNode
>
