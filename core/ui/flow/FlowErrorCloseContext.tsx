import { createContext, useContext } from 'react'

const FlowErrorCloseContext = createContext<(() => void) | null>(null)

export const FlowErrorCloseProvider = FlowErrorCloseContext.Provider

export const useFlowErrorClose = () => useContext(FlowErrorCloseContext)
