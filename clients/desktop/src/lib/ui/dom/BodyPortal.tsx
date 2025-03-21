import { ChildrenProp } from '@lib/ui/props'
import { createPortal } from 'react-dom'

import { useBody } from '../hooks/useBody'

export function BodyPortal({ children }: ChildrenProp) {
  const body = useBody()

  if (!body) return null

  return createPortal(children, body)
}
