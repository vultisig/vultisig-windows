import { KeygenStep } from '@core/mpc/keygen/KeygenStep'
import { useKeygenAction } from '@core/ui/mpc/keygen/state/keygenAction'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'

import { useMpcSigners } from '../../state/mpcSigners'

export const useKeygenMutation = () => {
  const [step, setStep] = useState<KeygenStep | null>(null)

  const keygenAction = useKeygenAction()

  const signers = useMpcSigners()

  const mutation = useMutation({
    mutationFn: async () => keygenAction({ onStepChange: setStep, signers }),
  })

  return {
    ...mutation,
    step,
  }
}
