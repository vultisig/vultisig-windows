import {
  AuthorizedPopupMethod,
  PopupInterface,
  PopupMethod,
} from '@core/inpage-provider/popup/interface'
import { OnFinishProp } from '@lib/ui/props'
import { Resolver } from '@lib/utils/types/Resolver'
import { ReactNode } from 'react'

import {
  AuthorizedCallContext,
  UnauthorizedCallContext,
} from '../../call/context'
import { PopupResponse } from '../resolver'

export type ResolvePopupInput<M extends PopupMethod> = Pick<
  PopupResponse<M>,
  'result' | 'shouldClosePopup'
>

export type PopupResolver<M extends PopupMethod> = Resolver<
  {
    input: PopupInterface[M]['input']
  } & OnFinishProp<ResolvePopupInput<M>> & {
      context: M extends AuthorizedPopupMethod
        ? AuthorizedCallContext
        : UnauthorizedCallContext
    },
  ReactNode
>
