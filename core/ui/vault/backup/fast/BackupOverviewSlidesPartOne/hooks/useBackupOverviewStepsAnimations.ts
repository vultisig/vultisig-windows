import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { useRive, useStateMachineInput } from '@rive-app/react-canvas'
import { useCallback } from 'react'

const STATE_MACHINE_NAME = 'State Machine 1'
const INPUT_NAME = 'Index'

export const BACKUP_VAULT_ANIMATIONS = [1, 2, 3] as const

export const useBackupOverviewStepsAnimations = () => {
  const { step: currentAnimation, toNextStep: toNextAnimation } =
    useStepNavigation({
      steps: BACKUP_VAULT_ANIMATIONS,
    })

  const { RiveComponent, rive } = useRive({
    src: '/core/animations/fast-vault-backup-overview.riv',
    autoplay: true,
    stateMachines: [STATE_MACHINE_NAME],
  })

  const stateMachineInput = useStateMachineInput(
    rive,
    STATE_MACHINE_NAME,
    INPUT_NAME
  )

  const handleNextAnimation = useCallback(() => {
    if (stateMachineInput && typeof stateMachineInput.value === 'number') {
      stateMachineInput.value += 1
      toNextAnimation()
    }
  }, [stateMachineInput, toNextAnimation])

  return {
    animations: BACKUP_VAULT_ANIMATIONS,
    animationComponent: RiveComponent,
    currentAnimation,
    handleNextAnimation,
    isLoading: !rive,
  }
}
