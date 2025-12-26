import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { useRive, useStateMachineInput } from '@rive-app/react-canvas'

const stateMachineName = 'State Machine 1'
const inputName = 'Index'

const animations = [1, 2, 3] as const

const updateRiveInputValue = (
  input: ReturnType<typeof useStateMachineInput>,
  delta: number
) => {
  if (input && typeof input.value === 'number') {
    input.value += delta
  }
}

export const useBackupOverviewStepsAnimations = () => {
  const {
    step: currentAnimation,
    toNextStep: toNextAnimation,
    toPreviousStep: toPreviousAnimation,
  } = useStepNavigation({ steps: animations })

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

  const handleNextAnimation = () => {
    if (
      typeof stateMachineInput?.value === 'number' &&
      stateMachineInput.value < animations.length
    ) {
      updateRiveInputValue(stateMachineInput, 1)
      toNextAnimation()
    }
  }

  // TODO: tony to refactor when the designer gives us the animations that work backwards
  const handlePrevAnimation = () => {
    if (
      typeof stateMachineInput?.value === 'number' &&
      stateMachineInput.value > 0
    ) {
      updateRiveInputValue(stateMachineInput, -1)
      toPreviousAnimation()
    }
  }

  return {
    animations,
    animationComponent: RiveComponent,
    currentAnimation,
    handlePrevAnimation,
    handleNextAnimation,
    isLoading: !rive,
  }
}
