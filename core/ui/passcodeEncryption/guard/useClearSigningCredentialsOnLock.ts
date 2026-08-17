import { useEffect } from 'react'

import { clearVaultPasswordCache } from '../../mpc/fast/passwordCache'

/**
 * Wipes cached signing credentials for as long as the app is locked. Runs on
 * every lock transition and on mount while already locked, so a password cached
 * before the lock cannot survive it — the passcode gate is meant to withhold
 * every credential, not just the passcode itself.
 */
export const useClearSigningCredentialsOnLock = (isLocked: boolean) => {
  useEffect(() => {
    if (!isLocked) {
      return
    }

    void clearVaultPasswordCache()
  }, [isLocked])
}
