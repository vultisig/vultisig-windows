import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { convertDuration } from '@lib/utils/time/convertDuration'
import { useCallback, useEffect, useRef } from 'react'
import { useState } from 'react'

import { usePasscodeAutoLock } from '../../storage/passcodeAutoLock'
import { usePasscode } from '../state/passcode'

export const PasscodeAutoLock = () => {
  const [passcode, setPasscode] = usePasscode()
  const passcodeAutoLock = shouldBePresent(usePasscodeAutoLock())

  const [lastInteractionAt, setLastInteractionAt] = useState<number | null>(
    null
  )
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const resetAutoLockTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    if (!passcode) {
      return
    }

    const lockDelayMs = convertDuration(passcodeAutoLock, 'min', 'ms')

    timeoutRef.current = setTimeout(() => {
      setPasscode(null)
    }, lockDelayMs)
  }, [passcodeAutoLock, passcode, setPasscode])

  const handleUserInteraction = () => {
    setLastInteractionAt(Date.now())
  }

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
    if (lastInteractionAt) {
      resetAutoLockTimer()
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [lastInteractionAt, resetAutoLockTimer])

  return null
}
