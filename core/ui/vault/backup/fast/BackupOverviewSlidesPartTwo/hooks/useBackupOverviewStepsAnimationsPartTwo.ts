import { useRive } from '@rive-app/react-canvas'

const stateMachineName = 'State Machine 1'

export const useBackupOverviewStepsAnimationsPartTwo = () => {
  const { RiveComponent, rive } = useRive({
    src: '/core/animations/fast-vault-backup-vault.riv',
    autoplay: true,
    stateMachines: [stateMachineName],
  })

  return {
    animationComponent: RiveComponent,
    isLoading: !rive,
  }
}
