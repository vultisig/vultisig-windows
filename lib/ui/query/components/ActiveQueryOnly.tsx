import { ChildrenProp, ValueProp } from '@lib/ui/props'

import { Query } from '../Query'
import { isInactiveQuery } from '../utils/isInactiveQuery'

export const ActiveQueryOnly: React.FC<
  ChildrenProp & ValueProp<Query<any>>
> = ({ children, value }) => {
  if (isInactiveQuery(value)) return null

  return <>{children}</>
}
