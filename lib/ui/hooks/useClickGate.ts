import { useCallback, useEffect, useRef } from 'react'

const defaultClickWindowMs = 800
const defaultMinNumberOfClicks = 3

export const useClickGate = (
  minNumberOfClicks = defaultMinNumberOfClicks,
  windowMs = defaultClickWindowMs
) => {
  const countRef = useRef(0)
  const timerRef = useRef<number | null>(null)

  const reset = () => {
    countRef.current = 0
    if (timerRef.current != null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  useEffect(() => reset, [])

  return useCallback(
    (action: () => void) => {
      if (timerRef.current != null) clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(reset, windowMs)

      countRef.current += 1
      if (countRef.current >= minNumberOfClicks) {
        reset()
        action()
      }
    },
    [windowMs, minNumberOfClicks]
  )
}
