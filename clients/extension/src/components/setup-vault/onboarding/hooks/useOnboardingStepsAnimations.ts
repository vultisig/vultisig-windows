import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { useRive, useStateMachineInput } from '@rive-app/react-canvas'
import { useCallback } from 'react'

const STATE_MACHINE_NAME = 'State Machine 1'
const INPUT_NAME = 'Index'

export const ONBOARDING_ANIMATIONS = [0, 1, 2, 3, 4, 5] as const

export const useOnboardingStepsAnimations = () => {
  const {
    step: currentAnimation,
    toNextStep: toNextAnimation,
    toPreviousStep: toPrevAnimation,
  } = useStepNavigation({
    steps: ONBOARDING_ANIMATIONS,
  })

  const { RiveComponent, rive } = useRive({
    src: '/assets/animations/onboarding-screen/onboarding.riv',
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

  // TODO: tony to refactor when the designer gives us the animations that work backwards
  const handlePrevAnimation = useCallback(() => {
    if (
      stateMachineInput &&
      typeof stateMachineInput.value === 'number' &&
      stateMachineInput.value - 1 >= 0
    ) {
      stateMachineInput.value -= 1
      toPrevAnimation()
    }
  }, [stateMachineInput, toPrevAnimation])

  return {
    animations: ONBOARDING_ANIMATIONS,
    animationComponent: RiveComponent,
    currentAnimation,
    handlePrevAnimation,
    handleNextAnimation,
    isLoading: !rive,
  }
}
