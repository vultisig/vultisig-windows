import { useCallback, useEffect, useState } from 'react'

type BaseProps<T> = {
  steps: readonly T[]
  initialStep?: T
}

type CircularProps<T> = BaseProps<T> & { circular: true; onExit?: never }
type LinearProps<T> = BaseProps<T> & { circular?: false; onExit?: () => void }

type UseStepNavigationInput<T> = CircularProps<T> | LinearProps<T>

export function useStepNavigation<T>({
  steps,
  initialStep = steps[0],
  circular = false,
  onExit,
}: UseStepNavigationInput<T>) {
  const [step, setStep] = useState<T>(initialStep)

  useEffect(() => {
    setStep(initialStep)
  }, [steps, initialStep])

  const toNextStep = useCallback(() => {
    setStep(prev => {
      const currentIndex = steps.indexOf(prev)
      const isLast = currentIndex === steps.length - 1

      return isLast ? (circular ? steps[0] : prev) : steps[currentIndex + 1]
    })
  }, [steps, circular])

  const toPreviousStep = useCallback(() => {
    setStep(prev => {
      const currentIndex = steps.indexOf(prev)
      const isFirst = currentIndex === 0

      if (isFirst) {
        if (circular) return steps[steps.length - 1]
        onExit?.()
      }

      return steps[currentIndex - 1]
    })
  }, [steps, circular, onExit])

  return { step, setStep, toNextStep, toPreviousStep }
}
