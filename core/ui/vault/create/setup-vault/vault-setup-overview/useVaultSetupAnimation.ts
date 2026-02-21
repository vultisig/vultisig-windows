import { useRive } from '@rive-app/react-webgl2'

const getVaultSetupAnimationFileName = (
  selectedDeviceCount: number
): string => {
  if (selectedDeviceCount <= 0) return 'vault_setup_device1'
  if (selectedDeviceCount >= 3) return 'vault_setup_device4'
  return `vault_setup_device${selectedDeviceCount + 1}`
}

export const useVaultSetupAnimation = (selectedDeviceCount: number) => {
  const animationFileName = getVaultSetupAnimationFileName(selectedDeviceCount)

  const { RiveComponent, rive } = useRive({
    src: `/core/animations/${animationFileName}.riv`,
    autoplay: true,
    stateMachines: ['State Machine 1'],
  })

  return {
    RiveComponent,
    isLoading: !rive,
  }
}
