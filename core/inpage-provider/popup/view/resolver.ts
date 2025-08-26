import {
  AuthorizedPopupMethod,
  PopupInterface,
  PopupMethod,
} from '@core/inpage-provider/popup/interface'
import { OnFinishProp } from '@lib/ui/props'
import { Resolver } from '@lib/utils/types/Resolver'
import { Result } from '@lib/utils/types/Result'
import { M } from 'framer-motion/dist/types.d-B50aGbjN'
import { ReactNode } from 'react'

import {
  AuthorizedCallContext,
  UnauthorizedCallContext,
} from '../../call/context'

export type PopupResolver<K extends PopupMethod> = Resolver<
  {
    input: PopupInterface[K]['input']
  } & OnFinishProp<Result<PopupInterface[K]['output']>> & {
      context: M extends AuthorizedPopupMethod
        ? AuthorizedCallContext
        : UnauthorizedCallContext
    },
  ReactNode
>
