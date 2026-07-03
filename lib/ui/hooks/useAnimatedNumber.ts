import { useEffect, useRef, useState } from 'react'

const defaultDuration = 1000

const easeOutCubic = (progress: number) => 1 - Math.pow(1 - progress, 3)

/**
 * Remembers the last number shown per `cacheKey`, surviving unmounts. Re-entering
 * a screen with an unchanged total reads from here and skips the count-up; only a
 * genuine change re-animates.
 */
const lastShownValues = new Map<string, number>()

/**
 * Rounds intermediate frames to a magnitude-based step so the fast-changing
 * low-order digits don't flicker: small totals count in cents, large totals count
 * in clean hundreds/thousands. This keeps the number of visible increments roughly
 * constant regardless of magnitude, so the motion always reads as smooth. The
 * final value is always shown exactly (not stepped).
 */
const quantizationStep = (value: number) => {
  const abs = Math.abs(value)
  if (abs < 1) {
    return 0.01
  }
  return Math.max(0.01, Math.pow(10, Math.floor(Math.log10(abs)) - 3))
}

const roundToStep = (value: number, step: number) =>
  Math.round(value / step) * step

type UseAnimatedNumberInput = {
  value: number
  cacheKey: string
  duration?: number
}

/**
 * Animates a number towards `value` only when it actually changes — a currency
 * switch, chains resolving, a refresh that moves the total. The first value (and
 * re-entering a screen with the same total) is shown instantly, so the count-up is
 * not replayed on every navigation. When `value` changes mid-flight the animation
 * resumes from the current number instead of snapping.
 *
 * Duration is fixed, so the per-second speed scales with the change: a small delta
 * counts slowly enough to read, a huge delta counts fast. Intermediate frames are
 * quantized (see `quantizationStep`) so large totals step in hundreds/thousands
 * rather than churning every digit.
 */
export const useAnimatedNumber = ({
  value,
  cacheKey,
  duration = defaultDuration,
}: UseAnimatedNumberInput) => {
  const [displayValue, setDisplayValue] = useState(
    () => lastShownValues.get(cacheKey) ?? value
  )
  const currentValueRef = useRef(displayValue)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    const startValue = currentValueRef.current

    if (startValue === value) {
      lastShownValues.set(cacheKey, value)
      return
    }

    const step = quantizationStep(value)
    let startTime: number | null = null

    const tick = (time: number) => {
      if (startTime === null) {
        startTime = time
      }

      const progress = Math.min((time - startTime) / duration, 1)
      const rawValue =
        startValue + (value - startValue) * easeOutCubic(progress)
      const nextValue = progress < 1 ? roundToStep(rawValue, step) : value

      currentValueRef.current = rawValue
      lastShownValues.set(cacheKey, nextValue)
      setDisplayValue(nextValue)

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick)
      }
    }

    frameRef.current = requestAnimationFrame(tick)

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [value, duration, cacheKey])

  return displayValue
}
