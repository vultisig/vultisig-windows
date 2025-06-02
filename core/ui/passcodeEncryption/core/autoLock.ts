import { convertDuration } from '@lib/utils/time/convertDuration'
import { useEffect } from 'react'
import { useState } from 'react'

import { usePasscodeAutoLock } from '../../storage/passcodeAutoLock'
import { usePasscode } from '../state/passcode'

export const useAutoLock = () => {
  const [passcode, setPasscode] = usePasscode()
  const passcodeAutoLock = usePasscodeAutoLock()

  const [passcodeUpdatedAt, setPasscodeUpdatedAt] = useState<number | null>(
    null
  )

  useEffect(() => {
    if (passcode) {
      setPasscodeUpdatedAt(Date.now())
    }
  }, [passcode])

  useEffect(() => {
    if (!passcodeAutoLock || !passcodeUpdatedAt || !passcode) {
      return
    }

    const autoLockTimeMs = convertDuration(passcodeAutoLock, 'min', 'ms')
    const timeElapsed = Date.now() - passcodeUpdatedAt
    const timeRemaining = autoLockTimeMs - timeElapsed

    if (timeRemaining <= 0) {
      setPasscode(null)
      return
    }

    const timeoutId = setTimeout(() => {
      setPasscode(null)
    }, timeRemaining)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [passcodeAutoLock, passcodeUpdatedAt, passcode, setPasscode])
}
