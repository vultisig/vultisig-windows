import { ChildrenProp } from '@lib/ui/props'
import { capitalizeFirstLetter } from '@lib/utils/capitalizeFirstLetter'
import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
} from 'react'

import { usePersistentState } from './usePersistentState'

type GetPersistentStateProviderSetup = <T>(
  name: string,
  getStorageKey: (vaultId?: string) => string
) => {
  provider: React.FC<ChildrenProp & { initialValue: T; vaultId?: string }>
  useState: () => [T, Dispatch<SetStateAction<T>>]
}

export const getPersistentStateProviderSetup: GetPersistentStateProviderSetup =
  (name, getStorageKey) => {
    type ContextState = { value: any; setValue: Dispatch<SetStateAction<any>> }
    const Context = createContext<ContextState | undefined>(undefined)

    const Provider = ({
      children,
      initialValue,
      vaultId,
    }: ChildrenProp & { initialValue: any; vaultId?: string }) => {
      const key = getStorageKey(vaultId)
      const [value, setValue] = usePersistentState({ key, initialValue })
      return (
        <Context.Provider value={{ value, setValue }}>
          {children}
        </Context.Provider>
      )
    }

    return {
      provider: Provider,
      useState: () => {
        const context = useContext(Context)
        if (!context) {
          throw new Error(`${capitalizeFirstLetter(name)} is not provided`)
        }
        return [context.value, context.setValue]
      },
    }
  }
