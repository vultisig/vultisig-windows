import { useEffect } from 'react'

import { usePasscodeAutoLockHolds } from './passcodeAutoLockHolds'

/**
 * Keeps the inactivity auto-lock from clearing the passcode while mounted.
 * Held by flows that must not lose the in-memory passcode to inactivity: an
 * MPC keygen ceremony can spend minutes waiting on peer devices with no local
 * interaction, and once the peers commit, the new key share can only be sealed
 * and persisted while the passcode is still in hand (#4598). Renders nothing.
 */
export const PasscodeAutoLockHold = () => {
  const [, setHolds] = usePasscodeAutoLockHolds()

  useEffect(() => {
    setHolds(count => count + 1)

    return () => setHolds(count => count - 1)
  }, [setHolds])

  return null
}
