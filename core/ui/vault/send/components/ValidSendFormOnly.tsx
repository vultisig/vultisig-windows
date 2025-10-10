import { ChildrenProp } from '@lib/ui/props'

import { useSendFormValidation } from '../queries/useSendFormValidation'

export const ValidSendFormOnly = ({ children }: ChildrenProp) => {
  const { isValid, isPending } = useSendFormValidation()

  if (isPending || !isValid) return null

  return <>{children}</>
}
