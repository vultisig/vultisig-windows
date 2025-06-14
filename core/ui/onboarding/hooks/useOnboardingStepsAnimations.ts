import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { useRive, useStateMachineInput } from '@rive-app/react-canvas'
import { useCallback } from 'react'

const stateMachineName = 'State Machine 1'
const inputName = 'Index'

const onboardingAnimations = [0, 1, 2, 3, 4, 5] as const

export const useOnboardingStepsAnimations = () => {
  const {
    step: currentAnimation,
    toNextStep: toNextAnimation,
    toFirstStep: toFirstAnimation,
  } = useStepNavigation({
    steps: onboardingAnimations,
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
    animations: onboardingAnimations,
    animationComponent: RiveComponent,
    currentAnimation,
    handlePrevAnimation,
    handleNextAnimation,
    isLoading: !rive,
  }
}
