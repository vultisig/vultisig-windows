import { useEffect, useState } from 'react'

import { useCore } from '../../state/core'
import { PasscodeAutoLockValue } from '../../storage/passcodeAutoLock'
import {
  computePasscodeUnlockSessionExpiresAt,
  PasscodeUnlockSession,
} from '../../storage/passcodeUnlockSession'
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

    getPasscodeUnlockSession()
      .then(session => {
        if (cancelled) {
          return
        }

        if (session !== null) {
          setPasscode(session.passcode)
        }

        setRestoreState({
          hasPasscodeEncryption,
          canPersistPasscodeUnlockSession,
          complete: true,
        })
      })
      .catch(() => {
        if (cancelled) {
          return
        }

        setRestoreState({
          hasPasscodeEncryption,
          canPersistPasscodeUnlockSession,
          complete: true,
        })
      })

    return () => {
      cancelled = true
    }
  }, [
    hasPasscodeEncryption,
    canPersistPasscodeUnlockSession,
    getPasscodeUnlockSession,
    setPasscode,
  ])

  useEffect(() => {
    if (!canPersistPasscodeUnlockSession) {
      return
    }

    if (!hasPasscodeEncryption) {
      void clearPasscodeUnlockSession()
      return
    }

    if (!restoreComplete) {
      return
    }

    if (passcode) {
      const session: PasscodeUnlockSession = {
        passcode,
        expiresAt: computePasscodeUnlockSessionExpiresAt(passcodeAutoLock),
      }
      void setPasscodeUnlockSession(session)
    } else {
      void clearPasscodeUnlockSession()
    }
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
