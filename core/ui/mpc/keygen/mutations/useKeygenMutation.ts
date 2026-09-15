import {
  ProtocolStatuses,
  useKeygenAction,
} from '@core/ui/mpc/keygen/state/keygenAction'
import { useMutation } from '@tanstack/react-query'
import { KeygenStep } from '@vultisig/core-mpc/keygen/KeygenStep'
import { useRef, useState } from 'react'

import { loadMpcEngine } from '../../bootstrapMpcEngine'
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
    setStep(step)
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
    mutationFn: async () => {
      // Every keygen action reaches the MPC engine the SDK registers, so the
      // SDK is awaited once here rather than in each action provider.
      await loadMpcEngine()

      return keygenAction({
        onStepChange: handleStepChange,
        onStepStart: handleStepStart,
        onStepComplete: handleStepComplete,
        signers,
      })
    },
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
