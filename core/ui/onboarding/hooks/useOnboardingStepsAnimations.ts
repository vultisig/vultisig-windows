import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { useRive, useStateMachineInput } from '@rive-app/react-canvas'
import { useCallback } from 'react'

const stateMachineName = 'State Machine 1'
const inputName = 'Index'

const animations = [1, 2, 3, 4, 5, 6] as const

export const useOnboardingStepsAnimations = () => {
  const {
    step: currentAnimation,
    toNextStep: toNextAnimation,
    toPreviousStep: toPreviousAnimation,
  } = useStepNavigation({
    steps: animations,
  })

  const { RiveComponent, rive } = useRive({
    src: '/core/animations/onboarding.riv',
    autoplay: true,
    stateMachines: [stateMachineName],
  })

  const stateMachineInput = useStateMachineInput(
    rive,
    stateMachineName,
    inputName
  )

  const handleNextAnimation = useCallback(() => {
    if (
      typeof stateMachineInput?.value === 'number' &&
      stateMachineInput.value < animations.length
    ) {
      stateMachineInput.value += 1
      toNextAnimation()
    }
  }, [stateMachineInput, toNextAnimation])

  // TODO: tony to refactor when the designer gives us the animations that work backwards
  const handlePrevAnimation = useCallback(() => {
    if (
      typeof stateMachineInput?.value === 'number' &&
      stateMachineInput.value > 0
    ) {
      stateMachineInput.value -= 1
      toPreviousAnimation()
    }
  }, [stateMachineInput, toPreviousAnimation])

  return {
    animations,
    animationComponent: RiveComponent,
    currentAnimation,
    handlePrevAnimation,
    handleNextAnimation,
    isLoading: !rive,
  }
}
