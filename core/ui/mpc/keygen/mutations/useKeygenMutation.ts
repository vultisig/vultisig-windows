import { KeygenStep } from '@core/mpc/keygen/KeygenStep'
import { useKeygenAction } from '@core/ui/mpc/keygen/state/keygenAction'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'

export const useKeygenMutation = () => {
  const [step, setStep] = useState<KeygenStep | null>(null)

  const keygenAction = useKeygenAction()

  const mutation = useMutation({
    mutationFn: async () => keygenAction({ onStepChange: setStep }),
  })

  return {
    ...mutation,
    step,
  }
}
