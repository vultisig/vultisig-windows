import { OnFinishProp } from '@lib/ui/props'
import { Resolver } from '@lib/utils/types/Resolver'
import { Result } from '@lib/utils/types/Result'
import { ReactNode } from 'react'

import { PopupApiInterface } from './interface'

export type PopupApiResolver<K extends keyof PopupApiInterface> = Resolver<
  {
    input: PopupApiInterface[K]['input']
  } & OnFinishProp<Result<PopupApiInterface[K]['output']>>,
  ReactNode
>
