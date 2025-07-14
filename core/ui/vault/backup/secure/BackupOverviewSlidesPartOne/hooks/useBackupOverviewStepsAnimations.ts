import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { useRive, useStateMachineInput } from '@rive-app/react-canvas'
import { useCallback, useMemo } from 'react'

const stateMachineName = 'State Machine 1'
const inputName = 'Index'

const backupVaultAnimations = [1, 2] as const

export const useBackupOverviewStepsAnimations = (numberOfShares: number) => {
  const { step: currentAnimation, toNextStep: toNextAnimation } =
    useStepNavigation({
      steps: backupVaultAnimations,
    })

  const animationName = useMemo(() => {
    if (numberOfShares >= 5) {
      return 'secure-vault-overview-5plus'
    }

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
