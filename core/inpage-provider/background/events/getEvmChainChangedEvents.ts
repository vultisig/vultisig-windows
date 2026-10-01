import { AppSession } from '@core/extension/storage/appSessions'

type GetEvmChainChangedEventsInput = {
  prevSessions: Record<string, AppSession>
  nextSessions: Record<string, AppSession>
}

/** An app whose selected EVM chain changed, with the chain it changed to. */
type EvmChainChangedEvent = {
  appId: string
  chainId: string
}

/**
 * Lists the apps whose selected EVM chain changed between two snapshots of a
 * vault's sessions, including a session's first EVM chain (unset → set).
 * Sessions that were added or removed, and chains that were cleared, emit
 * nothing.
 */
export const getEvmChainChangedEvents = ({
  prevSessions,
  nextSessions,
}: GetEvmChainChangedEventsInput): EvmChainChangedEvent[] =>
  Object.entries(nextSessions).flatMap(([appId, nextSession]) => {
    const prevSession = prevSessions[appId]
    if (!prevSession) return []

    const prevChainId = prevSession.selectedEVMChainId
    const nextChainId = nextSession.selectedEVMChainId

    if (!nextChainId || prevChainId === nextChainId) return []

    return [{ appId, chainId: nextChainId }]
  })
