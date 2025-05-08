import { useBody } from '@lib/ui/hooks/useBody'
import { ChildrenProp } from '@lib/ui/props'
import { createPortal } from 'react-dom'

export function BodyPortal({ children }: ChildrenProp) {
  const body = useBody()

  if (!body) return null

  return createPortal(children, body)
}
