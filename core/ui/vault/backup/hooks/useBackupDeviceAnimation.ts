import { useRive } from '@rive-app/react-webgl2'

const getBackupAnimationFileName = (userDeviceCount: number): string => {
  if (userDeviceCount <= 1) return 'backup_device1'
  if (userDeviceCount >= 4) return 'backup_device4'
  return `backup_device${userDeviceCount}`
}

export const useBackupDeviceAnimation = (userDeviceCount: number) => {
  const animationFileName = getBackupAnimationFileName(userDeviceCount)

  const { RiveComponent, rive } = useRive({
    src: `/core/animations/${animationFileName}.riv`,
    autoplay: true,
  })

  return {
    RiveComponent,
    isLoading: !rive,
  }
}
