import { ChildrenProp } from '@lib/ui/props'

import { useRedirect } from '../navigation/hooks/useRedirect'

export const AuthProvider = ({ children }: ChildrenProp) => {
  const isRedirecting = useRedirect()

  if (isRedirecting) {
    return null
  }

  return children
}
