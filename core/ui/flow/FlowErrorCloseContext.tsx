import { createContext, useContext } from 'react'

/**
 * Overrides what the close control on a full-page error screen does, and hands
 * the handler the error that screen is showing. The popup uses it to finish the
 * dApp call with a failure that matches the error, rather than navigating home.
 */
const FlowErrorCloseContext = createContext<((error?: unknown) => void) | null>(
  null
)

export const FlowErrorCloseProvider = FlowErrorCloseContext.Provider

/**
 * The current flow-level close handler, or `null` when no flow provides one and
 * the error screen should fall back to its own navigation.
 */
export const useFlowErrorClose = () => useContext(FlowErrorCloseContext)
