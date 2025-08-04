import { OnFinishProp } from '@lib/ui/props'
import { Result } from '@lib/utils/types/Result'
import { ReactNode } from 'react'

import { PopupApiInterface } from './interface'

type PopupApiResolverProps<K extends keyof PopupApiInterface> = {
  input: PopupApiInterface[K]['input']
} & OnFinishProp<Result<PopupApiInterface[K]['output']>>

export type PopupApiResolver<K extends keyof PopupApiInterface> = (
  props: PopupApiResolverProps<K>
) => ReactNode
