import { convertDuration } from '@lib/utils/time/convertDuration'
import { useEffect } from 'react'
import { useState } from 'react'

import { usePasscodeAutoLock } from '../../../storage/passcodeAutoLock'
import { usePasscode } from '../../state/passcode'

export const useAutoLock = () => {
  const [passcode, setPasscode] = usePasscode()
  const passcodeAutoLock = usePasscodeAutoLock()

  const [passcodeEnteredAt, setPasscodeEnteredAt] = useState<number | null>(
    null
  )

  useEffect(() => {
    setPasscodeEnteredAt(passcode ? Date.now() : null)
  }, [passcode])

  useEffect(() => {
    if (!passcodeAutoLock || !passcodeEnteredAt || !passcode) {
      return
    }

    const lockAt =
      passcodeEnteredAt + convertDuration(passcodeAutoLock, 'min', 'ms')
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
  }, [passcode, passcodeAutoLock, passcodeEnteredAt, setPasscode])
}
