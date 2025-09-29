import { Tx } from '@core/chain/tx'
import { KeysignMessagePayload } from '@core/mpc/keysign/keysignPayload/KeysignMessagePayload'
import { createContext, ReactNode, useContext } from 'react'

type KeysignResultContextValue = {
  onComplete?: () => void
  customResultRenderer?: (
    result:
      | {
          txs: Tx[]
        }
      | {
          signature: string
        },
    payload: KeysignMessagePayload
  ) => ReactNode
}

const KeysignResultContext = createContext<
  KeysignResultContextValue | undefined
>(undefined)

type KeysignResultProviderProps = {
  value: KeysignResultContextValue
  children: ReactNode
}

export const KeysignResultProvider = ({
  value,
  children,
}: KeysignResultProviderProps) => (
  <KeysignResultContext.Provider value={value}>
    {children}
  </KeysignResultContext.Provider>
)

export const useKeysignResultContext = () => {
  const context = useContext(KeysignResultContext)
  if (!context) {
    throw new Error(
      'useKeysignResultContext must be used within KeysignResultProvider'
    )
  }
  return context
}
