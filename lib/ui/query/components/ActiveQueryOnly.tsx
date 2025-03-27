import { ChildrenProp, ValueProp } from '@lib/ui/props'

import { Query } from '../Query'

export const ActiveQueryOnly: React.FC<
  ChildrenProp & ValueProp<Query<any>>
> = ({ children, value }) => {
  const isActive =
    value.data !== undefined ||
    value.error ||
    (value.isPending && value.isLoading)

  if (isActive) {
    return <>{children}</>
  }

  return null
}
