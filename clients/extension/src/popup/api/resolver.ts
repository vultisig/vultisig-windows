import { PopupInterface } from '@core/inpage-provider/popup/interface'
import { OnFinishProp } from '@lib/ui/props'
import { Resolver } from '@lib/utils/types/Resolver'
import { Result } from '@lib/utils/types/Result'
import { ReactNode } from 'react'

export type PopupApiResolver<K extends keyof PopupInterface> = Resolver<
  {
    input: PopupInterface[K]['input']
  } & OnFinishProp<Result<PopupInterface[K]['output']>>,
  ReactNode
>
