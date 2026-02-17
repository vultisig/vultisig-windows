import { ChildrenProp } from '@lib/ui/props'
import { createContext, useContext } from 'react'

export function setupOptionalValueProvider<T>() {
  const ValueContext = createContext<T | undefined>(undefined)

  type Props = ChildrenProp & { value: T }

  const ValueProvider = ({ children, value }: Props) => (
    <ValueContext.Provider value={value}>{children}</ValueContext.Provider>
  )

  return [ValueProvider, () => useContext(ValueContext)] as const
}
