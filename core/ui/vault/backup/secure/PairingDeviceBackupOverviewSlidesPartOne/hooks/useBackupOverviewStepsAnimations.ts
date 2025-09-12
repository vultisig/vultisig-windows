import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { useRive, useStateMachineInput } from '@rive-app/react-canvas'
import { useCallback, useMemo } from 'react'

const stateMachineName = 'State Machine 1'
const inputName = 'Index'

const animations = [1, 2] as const

export const useBackupOverviewStepsAnimations = (
  numberOfShares: number,
  deviceNumber: number
) => {
  const {
    step: currentAnimation,
    toNextStep: toNextAnimation,
    toPreviousStep: toPreviousAnimation,
  } = useStepNavigation({ steps: animations })

  const extensionBasedOnNumOfDevices = useMemo(() => {
    return numberOfShares === 2 || numberOfShares === 3
      ? '2of3'
      : numberOfShares === 4
        ? '3of4'
        : '5plus'
  }, [numberOfShares])

  const { RiveComponent, rive } = useRive({
    src: `/core/animations/secure-vault-overview-${extensionBasedOnNumOfDevices}${deviceNumber >= 5 ? '' : `-${deviceNumber}`}.riv`,
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
