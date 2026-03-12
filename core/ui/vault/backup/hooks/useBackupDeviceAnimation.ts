import { useRive } from '@rive-app/react-webgl2'

import { getBackupDeviceAnimationSource } from '../getBackupAnimationSource'

export const useBackupDeviceAnimation = (userDeviceCount: number) => {
  const animationSource = getBackupDeviceAnimationSource(userDeviceCount)

  const { RiveComponent, rive } = useRive({
    src: `/core/animations/${animationSource}.riv`,
    autoplay: true,
  })

  return {
    RiveComponent,
    isLoading: !rive,
  }
}
