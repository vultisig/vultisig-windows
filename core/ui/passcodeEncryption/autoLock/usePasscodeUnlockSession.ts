import { useEffect, useState } from 'react'

import { useCore } from '../../state/core'
import { PasscodeAutoLockValue } from '../../storage/passcodeAutoLock'
import {
  computePasscodeUnlockSessionExpiresAt,
  PasscodeUnlockSession,
} from '../../storage/passcodeUnlockSession'
import { withPasscodeOperationLock } from '../core/passcodeAttemptThrottle'
import { verifyPasscode } from '../core/passcodeLock'
import { usePasscode } from '../state/passcode'

type UsePasscodeUnlockSessionInput = {
  hasPasscodeEncryption: boolean
  passcodeAutoLock: PasscodeAutoLockValue
}

type RestoreState = {
  hasPasscodeEncryption: boolean
  canPersistPasscodeUnlockSession: boolean
  complete: boolean
}

export const usePasscodeUnlockSession = ({
  hasPasscodeEncryption,
  passcodeAutoLock,
}: UsePasscodeUnlockSessionInput) => {
  const [passcode, setPasscode] = usePasscode()
  const {
    canPersistPasscodeUnlockSession,
    getPasscodeUnlockSession,
    setPasscodeUnlockSession,
    clearPasscodeUnlockSession,
    getPasscodeEncryption,
    getVaults,
  } = useCore()

  const [restoreState, setRestoreState] = useState<RestoreState>(() => {
    const complete = !hasPasscodeEncryption || !canPersistPasscodeUnlockSession

    return {
      hasPasscodeEncryption,
      canPersistPasscodeUnlockSession,
      complete,
    }
  })

  const restoreStateMatchesCurrentInput =
    restoreState.hasPasscodeEncryption === hasPasscodeEncryption &&
    restoreState.canPersistPasscodeUnlockSession ===
      canPersistPasscodeUnlockSession

  const restoreComplete = restoreStateMatchesCurrentInput
    ? restoreState.complete
    : !hasPasscodeEncryption || !canPersistPasscodeUnlockSession

  useEffect(() => {
    if (!hasPasscodeEncryption) {
      setRestoreState({
        hasPasscodeEncryption,
        canPersistPasscodeUnlockSession,
        complete: true,
      })
      return
    }

    if (!canPersistPasscodeUnlockSession) {
      setRestoreState({
        hasPasscodeEncryption,
        canPersistPasscodeUnlockSession,
        complete: true,
      })
      return
    }

    setRestoreState({
      hasPasscodeEncryption,
      canPersistPasscodeUnlockSession,
      complete: false,
    })

    let cancelled = false

    const restorePasscodeUnlockSession = async () => {
      await withPasscodeOperationLock(async () => {
        try {
          const session = await getPasscodeUnlockSession()

          if (cancelled || session === null) {
            return
          }

          const [passcodeEncryption, vaults] = await Promise.all([
            getPasscodeEncryption(),
            getVaults(),
          ])

          if (cancelled) {
            return
          }

          const isValid = await verifyPasscode({
            vaults,
            encryptedSample: passcodeEncryption?.encryptedSample ?? null,
            passcode: session.passcode,
          })

          if (cancelled) {
            return
          }

          if (isValid) {
            setPasscode(session.passcode)
          } else {
            await clearPasscodeUnlockSession()
          }
        } catch {
          if (!cancelled) {
            await clearPasscodeUnlockSession().catch(() => {})
          }
        }
      }).finally(() => {
        if (!cancelled) {
          setRestoreState({
            hasPasscodeEncryption,
            canPersistPasscodeUnlockSession,
            complete: true,
          })
        }
      })
    }

    void restorePasscodeUnlockSession()

    return () => {
      cancelled = true
    }
  }, [
    hasPasscodeEncryption,
    canPersistPasscodeUnlockSession,
    clearPasscodeUnlockSession,
    getPasscodeEncryption,
    getPasscodeUnlockSession,
    getVaults,
    setPasscode,
  ])

  useEffect(() => {
    if (!canPersistPasscodeUnlockSession) {
      return
    }

    if (hasPasscodeEncryption && !restoreComplete) {
      return
    }

    void withPasscodeOperationLock(async () => {
      if (!hasPasscodeEncryption) {
        await clearPasscodeUnlockSession()
        return
      }

      if (passcode) {
        const session: PasscodeUnlockSession = {
          passcode,
          expiresAt: computePasscodeUnlockSessionExpiresAt(passcodeAutoLock),
        }
        await setPasscodeUnlockSession(session)
      } else {
        await clearPasscodeUnlockSession()
      }
    })
  }, [
    hasPasscodeEncryption,
    passcode,
    passcodeAutoLock,
    restoreComplete,
    canPersistPasscodeUnlockSession,
    setPasscodeUnlockSession,
    clearPasscodeUnlockSession,
  ])

  return {
    restoreComplete,
    pendingPasscodeUnlockRestore:
      hasPasscodeEncryption &&
      !restoreComplete &&
      canPersistPasscodeUnlockSession,
  }
}
