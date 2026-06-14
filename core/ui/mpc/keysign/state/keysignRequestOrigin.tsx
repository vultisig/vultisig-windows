import { ChildrenProp } from '@lib/ui/props'
import { createContext, useContext } from 'react'

/**
 * dApp request origin for the active keysign, when it originates from a dApp
 * sign-message request. Used to scope the custom-message signature cache per
 * origin (issue #1147). `undefined` for in-app keysigns or when no provider is
 * mounted, so the hook is safe to call from any keysign flow.
 */
const KeysignRequestOriginContext = createContext<string | undefined>(undefined)

export const KeysignRequestOriginProvider = ({
  value,
  children,
}: ChildrenProp & { value: string | undefined }) => (
  <KeysignRequestOriginContext.Provider value={value}>
    {children}
  </KeysignRequestOriginContext.Provider>
)

export const useKeysignRequestOrigin = (): string | undefined =>
  useContext(KeysignRequestOriginContext)
