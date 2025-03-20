import { ChildrenProp } from '@lib/ui/props'
import { ReactNode } from 'react'

type WrapProps = ChildrenProp & {
  wrap?: (children: ReactNode) => ReactNode
}

export const Wrap = ({ children, wrap }: WrapProps) => {
  return wrap ? wrap(children) : children
}
