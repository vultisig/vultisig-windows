import { KeygenStep } from '@core/mpc/keygen/KeygenStep'
import {
  ProtocolStatuses,
  useKeygenAction,
} from '@core/ui/mpc/keygen/state/keygenAction'
import { useMutation } from '@tanstack/react-query'
import { useRef, useState } from 'react'

import { useMpcSigners } from '../../devices/state/signers'

export const useKeygenMutation = () => {
  const [step, setStep] = useState<KeygenStep | null>(null)
  const [protocolStatuses, setProtocolStatuses] = useState<ProtocolStatuses>({})
  const prevStepRef = useRef<KeygenStep | null>(null)

  const keygenAction = useKeygenAction()
  const signers = useMpcSigners()

  const handleStepChange = (newStep: KeygenStep) => {
    setStep(newStep)
    setProtocolStatuses(prev => {
      const next = { ...prev }
      const prevStep = prevStepRef.current
      if (prevStep && next[prevStep]) {
        next[prevStep] = { status: 'completed' }
      }
      next[newStep] = { status: 'in_progress' }
      return next
    })
    prevStepRef.current = newStep
  }

  const handleStepStart = (step: KeygenStep) => {
    setProtocolStatuses(prev => ({
      ...prev,
      [step]: { status: 'in_progress' },
    }))
  }

  const handleStepComplete = (step: KeygenStep) => {
    setProtocolStatuses(prev => ({
      ...prev,
      [step]: { status: 'completed' },
    }))
  }

  const mutation = useMutation({
    mutationFn: async () =>
      keygenAction({
        onStepChange: handleStepChange,
        onStepStart: handleStepStart,
        onStepComplete: handleStepComplete,
        signers,
      }),
    onSuccess: () => {
      setProtocolStatuses(prev => {
        const next = { ...prev }
        const lastStep = prevStepRef.current
        if (lastStep && next[lastStep]) {
          next[lastStep] = { status: 'completed' }
        }
        return next
      })
    },
  })

  return {
    ...mutation,
    step,
    protocolStatuses,
  }
}
