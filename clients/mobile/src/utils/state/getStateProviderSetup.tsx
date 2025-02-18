import { capitalizeFirstLetter } from '@lib/utils/capitalizeFirstLetter'
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useState,
} from 'react'

export function getStateProviderSetup<T>(name: string) {
  type ContextState = { value: T; setValue: Dispatch<SetStateAction<T>> }

  const Context = createContext<ContextState | undefined>(undefined)

  type Props = PropsWithChildren & { initialValue: T }

  const Provider = ({ children, initialValue }: Props) => {
    const [value, setValue] = useState(initialValue)

    return (
      <Context.Provider value={{ value, setValue }}>
        {children}
      </Context.Provider>
    )
  }

  return {
    provider: Provider,
    useState: (): [T, Dispatch<SetStateAction<T>>] => {
      const context = useContext(Context)

      if (!context) {
        throw new Error(`${capitalizeFirstLetter(name)} is not provided`)
      }

      return [context.value, context.setValue]
    },
  }
}
