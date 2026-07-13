import { ChildrenProp } from '@lib/ui/props'
import { createContext, useContext } from 'react'

/**
 * Metadata about the dApp that initiated the current flow. Present only for
 * dApp / deep-link initiated transactions; absent for in-wallet and desktop
 * flows.
 */
type DappRequest = {
  origin: string
  name?: string
  favicon?: string
}

const DappRequestContext = createContext<DappRequest | null>(null)

/**
 * Provides the initiating dApp's metadata to descendants. Wrap dApp-initiated
 * flows with this so shared screens (e.g. the keysign Done screen) can surface
 * a "Request from" banner without depending on the extension popup layer.
 */
export const DappRequestProvider = ({
  value,
  children,
}: ChildrenProp & { value: DappRequest | null }) => (
  <DappRequestContext.Provider value={value}>
    {children}
  </DappRequestContext.Provider>
)

/** Returns the initiating dApp's metadata, or null when not dApp-initiated. */
export const useDappRequest = (): DappRequest | null =>
  useContext(DappRequestContext)
