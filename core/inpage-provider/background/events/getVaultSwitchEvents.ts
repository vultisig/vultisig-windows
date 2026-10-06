import { AppSession } from '@core/extension/storage/appSessions'
import { without } from '@vultisig/lib-utils/array/without'

type GetVaultSwitchEventsInput = {
  prevVaultSessions: Record<string, AppSession>
  nextVaultSessions: Record<string, AppSession>
}

/** Apps to notify after the current vault changed. */
type VaultSwitchEvents = {
  disconnect: string[]
  accountsChanged: string[]
}

/**
 * Splits the apps affected by a switch of the current vault: apps connected
 * only to the previous vault lose their accounts (`disconnect`), and apps
 * connected to the new vault re-read theirs (`accountsChanged`).
 */
export const getVaultSwitchEvents = ({
  prevVaultSessions,
  nextVaultSessions,
}: GetVaultSwitchEventsInput): VaultSwitchEvents => {
  const nextApps = Object.keys(nextVaultSessions)

  return {
    disconnect: without(Object.keys(prevVaultSessions), ...nextApps),
    accountsChanged: nextApps,
  }
}
