import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { useRive, useStateMachineInput } from '@rive-app/react-webgl2'
import { useMemo } from 'react'

const stateMachineName = 'State Machine 1'
const inputName = 'Index'

const animations = [1, 2] as const

const updateRiveInputValue = (
  input: ReturnType<typeof useStateMachineInput>,
  delta: number
) => {
  if (input && typeof input.value === 'number') {
    input.value += delta
  }
}

export const useBackupOverviewStepsAnimations = (numberOfShares: number) => {
  const {
    step: currentAnimation,
    toNextStep: toNextAnimation,
    toPreviousStep: toPreviousAnimation,
  } = useStepNavigation({ steps: animations })

  const animationName = useMemo(() => {
    if (numberOfShares >= 5) return 'secure-vault-overview-5plus'

    return `secure-vault-backup-${numberOfShares > 3 ? '3of4' : '2of3'}`
  }, [numberOfShares])

  const { RiveComponent, rive } = useRive({
    src: `/core/animations/${animationName}.riv`,
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
