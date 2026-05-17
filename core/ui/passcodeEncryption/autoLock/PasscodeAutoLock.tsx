import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { convertDuration } from '@vultisig/lib-utils/time/convertDuration'
import { useEffect, useRef, useState } from 'react'

import { useCore } from '../../state/core'
import { usePasscodeAutoLock } from '../../storage/passcodeAutoLock'
import { computePasscodeUnlockSessionExpiresAt } from '../../storage/passcodeUnlockSession'
import { usePasscode } from '../state/passcode'

export const PasscodeAutoLock = () => {
  const [passcode, setPasscode] = usePasscode()
  const passcodeAutoLock = shouldBePresent(usePasscodeAutoLock())
  const { setPasscodeUnlockSession } = useCore()

  const [lastInteractionAt, setLastInteractionAt] = useState<number | null>(
    null
  )
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (passcode) {
      setLastInteractionAt(Date.now())
    } else {
      setLastInteractionAt(null)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [passcode])

  useEffect(() => {
    if (!passcode) {
      return
    }

    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ]

    const handleUserInteraction = () => {
      setLastInteractionAt(Date.now())
    }

    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, true)
    })

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction, true)
      })
    }
  }, [passcode])

  useEffect(() => {
    if (!passcode || !lastInteractionAt) {
      return
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    const lockDelayMs = convertDuration(passcodeAutoLock, 'min', 'ms')

    timeoutRef.current = setTimeout(() => {
      setPasscode(null)
    }, lockDelayMs)

    void setPasscodeUnlockSession({
      passcode,
      expiresAt: computePasscodeUnlockSessionExpiresAt(passcodeAutoLock),
    })

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [
    lastInteractionAt,
    passcode,
    passcodeAutoLock,
    setPasscode,
    setPasscodeUnlockSession,
  ])

  return null
}
