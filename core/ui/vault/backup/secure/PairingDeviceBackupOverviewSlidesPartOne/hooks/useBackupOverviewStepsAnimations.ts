import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { useRive, useStateMachineInput } from '@rive-app/react-canvas'
import { useCallback } from 'react'

const stateMachineName = 'State Machine 1'
const inputName = 'Index'

const backupVaultAnimations = [1, 2] as const

export const useBackupOverviewStepsAnimations = (
  numberOfShares: number,
  deviceNumber: number
) => {
  const { step: currentAnimation, toNextStep: toNextAnimation } =
    useStepNavigation({
      steps: backupVaultAnimations,
    })

  const extensionBasedOnNumOfDevices =
    numberOfShares === 2 || numberOfShares === 3
      ? '2of3'
      : numberOfShares === 4
        ? '3of4'
        : '5plus'

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
    if (stateMachineInput && typeof stateMachineInput.value === 'number') {
      stateMachineInput.value += 1
      toNextAnimation()
    }
  }, [stateMachineInput, toNextAnimation])

  return {
    animations: backupVaultAnimations,
    animationComponent: RiveComponent,
    currentAnimation,
    handleNextAnimation,
    isLoading: !rive,
  }
}
