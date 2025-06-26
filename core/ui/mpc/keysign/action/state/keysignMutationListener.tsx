import { TxResult } from '@core/chain/tx/execute/ExecuteTxResolver'
import { createContext, useContext } from 'react'

export type KeysignMutationListener = {
  onSuccess?: (result: TxResult[]) => void
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
