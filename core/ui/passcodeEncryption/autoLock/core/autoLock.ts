import { convertDuration } from '@lib/utils/time/convertDuration'
import { useEffect } from 'react'
import { useState } from 'react'

import { usePasscodeAutoLock } from '../../../storage/passcodeAutoLock'
import { usePasscode } from '../../state/passcode'

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

    const lockAt =
      passcodeUpdatedAt + convertDuration(passcodeAutoLock, 'min', 'ms')
    const timeUntilLock = lockAt - Date.now()

    if (timeUntilLock <= 0) {
      setPasscode(null)
      return
    }

    const timeoutId = setTimeout(() => {
      setPasscode(null)
    }, timeUntilLock)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [passcodeAutoLock, passcodeUpdatedAt, passcode, setPasscode])
}
