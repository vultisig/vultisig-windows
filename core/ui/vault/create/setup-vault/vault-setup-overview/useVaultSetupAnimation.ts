import { useRive } from '@rive-app/react-webgl2'

import { getVaultSetupAnimationSource } from './getVaultSetupAnimationSource'

export const useVaultSetupAnimation = (selectedDeviceCount: number) => {
  const animationSource = getVaultSetupAnimationSource(selectedDeviceCount)

  const { RiveComponent, rive } = useRive({
    src: `/core/animations/${animationSource}.riv`,
    autoplay: true,
    stateMachines: ['State Machine 1'],
  })

  return {
    RiveComponent,
    isLoading: !rive,
  }
}
