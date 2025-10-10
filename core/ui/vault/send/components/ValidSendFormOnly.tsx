import { ChildrenProp } from '@lib/ui/props'
import { isRecordEmpty } from '@lib/utils/record/isRecordEmpty'

import { useSendValidationQuery } from '../queries/useSendValidationQuery'

export const ValidSendFormOnly = ({ children }: ChildrenProp) => {
  const { data } = useSendValidationQuery()

  if (!data || !isRecordEmpty(data)) return null

  return <>{children}</>
}
