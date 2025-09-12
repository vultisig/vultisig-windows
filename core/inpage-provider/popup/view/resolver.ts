import {
  AuthorizedPopupMethod,
  PopupInterface,
  PopupMethod,
} from '@core/inpage-provider/popup/interface'
import { OnFinishProp } from '@lib/ui/props'
import { Resolver } from '@lib/utils/types/Resolver'
import { ReactNode } from 'react'

import { MethodBasedContext } from '../../call/context'
import { PopupResponse } from '../resolver'

export type ResolvePopupInput<M extends PopupMethod> = Pick<
  PopupResponse<M>,
  'result' | 'shouldClosePopup'
>

export type PopupResolver<M extends PopupMethod> = Resolver<
  {
    input: PopupInterface[M]['input']
  } & OnFinishProp<ResolvePopupInput<M>> & {
      context: MethodBasedContext<M, AuthorizedPopupMethod>
    },
  ReactNode
>
