import { ChildrenProp } from '@lib/ui/props'
import { createContext, useContext } from 'react'

// Returns undefined instead of throwing when no provider exists
// Use for values that may or may not be present depending on flow
export function getOptionalValueProviderSetup<T>() {
  const ValueContext = createContext<T | undefined>(undefined)

  type Props = ChildrenProp & { value: T }

  const ValueProvider = ({ children, value }: Props) => (
    <ValueContext.Provider value={value}>{children}</ValueContext.Provider>
  )

  return {
    provider: ValueProvider,
    useValue: () => useContext(ValueContext), // Returns undefined if no provider
  }
}
