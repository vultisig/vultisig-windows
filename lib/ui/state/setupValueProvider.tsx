import { ChildrenProp } from '@lib/ui/props'
import { createContext } from 'react'

import { createContextHook } from './createContextHook'

export function setupValueProvider<T>(contextId: string) {
  const ValueContext = createContext<T | undefined>(undefined)
  type Props = ChildrenProp & { value: T }

  const ValueProvider = ({ children, value }: Props) => {
    return (
      <ValueContext.Provider value={value}>{children}</ValueContext.Provider>
    )
  }

  return [
    ValueProvider,
    createContextHook(ValueContext, contextId),
    ValueContext,
  ] as const
}
