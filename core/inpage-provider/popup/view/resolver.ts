import {
  AuthorizedPopupMethod,
  PopupInterface,
  PopupMethod,
} from '@core/inpage-provider/popup/interface'
import { OnFinishProp } from '@lib/ui/props'
import { Resolver } from '@lib/utils/types/Resolver'
import { Result } from '@lib/utils/types/Result'
import { ReactNode } from 'react'

import {
  AuthorizedCallContext,
  UnauthorizedCallContext,
} from '../../call/context'

export type PopupResolver<M extends PopupMethod> = Resolver<
  {
    input: PopupInterface[M]['input']
  } & OnFinishProp<Result<PopupInterface[M]['output']>> & {
      context: M extends AuthorizedPopupMethod
        ? AuthorizedCallContext
        : UnauthorizedCallContext
    },
  ReactNode
>
