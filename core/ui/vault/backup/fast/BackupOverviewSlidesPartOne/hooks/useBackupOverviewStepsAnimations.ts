import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { useRive, useStateMachineInput } from '@rive-app/react-canvas'
import { useCallback } from 'react'

const stateMachineName = 'State Machine 1'
const inputName = 'Index'

const backupVaultAnimations = [1, 2, 3] as const

export const useBackupOverviewStepsAnimations = () => {
  const {
    step: currentAnimation,
    toNextStep: toNextAnimation,
    toFirstStep: toFirstAnimation,
  } = useStepNavigation({
    steps: backupVaultAnimations,
  })

  const { RiveComponent, rive } = useRive({
    src: '/core/animations/fast-vault-backup-overview.riv',
    autoplay: true,
    stateMachines: [stateMachineName],
  })

  const stateMachineInput = useStateMachineInput(
    rive,
    stateMachineName,
    inputName
  )

  const handleNextAnimation = useCallback(() => {
    if (stateMachineInput && typeof stateMachineInput.value === 'number') {
      stateMachineInput.value += 1
      toNextAnimation()
    }
  }, [stateMachineInput, toNextAnimation])

  // TODO: tony to refactor when the designer gives us the animations that work backwards
  const handlePrevAnimation = useCallback(() => {
    if (
      stateMachineInput &&
      typeof stateMachineInput.value === 'number' &&
      stateMachineInput.value - 1 >= 0
    ) {
      stateMachineInput.value -= 1
      toFirstAnimation()
    }
  }, [stateMachineInput, toFirstAnimation])

  return {
    animations: backupVaultAnimations,
    animationComponent: RiveComponent,
    currentAnimation,
    handlePrevAnimation,
    handleNextAnimation,
    isLoading: !rive,
  }
}
