import { isEmpty } from '@vultisig/lib-utils/array/isEmpty'
import { Children, ReactNode } from 'react'

export const areEmptyChildren = (children: ReactNode) =>
  isEmpty(Children.toArray(children).filter(Boolean))
