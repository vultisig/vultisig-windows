import { ValueProp } from '@lib/ui/props'
import { Defined } from '@lib/utils/types/Defined'
import { ReactNode } from 'react'

import { Query } from '../Query'

export type MatchQueryProps<T, E = unknown> = ValueProp<Query<T, E>> & {
  error?: (error: E) => ReactNode
  pending?: () => ReactNode
  success?: (data: Defined<T>) => ReactNode
  inactive?: () => ReactNode
}

export function MatchQuery<T, E = unknown>({
  value,
  error = () => null,
  pending = () => null,
  success = () => null,
  inactive = () => null,
}: MatchQueryProps<T, E>) {
  if (value.data !== undefined) {
    return <>{success(value.data as Defined<T>)}</>
  }

  if (value.error) {
    return <>{error(value.error)}</>
  }

  if (value.isPending) {
    return <>{pending()}</>
  }

  return <>{inactive()}</>
}
