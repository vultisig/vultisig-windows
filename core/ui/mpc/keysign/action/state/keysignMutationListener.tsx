import { KeysignResult } from '@core/mpc/keysign/KeysignResult'
import { createContext, useContext } from 'react'

export type KeysignMutationListener = {
  onSuccess?: (result: KeysignResult) => void
  onError?: (error: Error) => void
}

type KeysignMutationListenerContextValue = KeysignMutationListener

const KeysignMutationListenerContext =
  createContext<KeysignMutationListenerContextValue>({})

export const KeysignMutationListenerProvider =
  KeysignMutationListenerContext.Provider

export const useKeysignMutationListener = () => {
  return useContext(KeysignMutationListenerContext)
}
