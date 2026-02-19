const backupDeviceAnimationSources = [
  'backup-1device',
  'backup-2devices',
  'backup-3devices',
  'backup-4devices',
] as const

type BackupDeviceAnimationSource = (typeof backupDeviceAnimationSources)[number]

const maxBackupDeviceAnimationIndex = backupDeviceAnimationSources.length - 1

const getBackupDeviceAnimationIndex = (userDeviceCount: number): number => {
  const normalizedDeviceCount = Math.floor(userDeviceCount)
  if (normalizedDeviceCount <= 1) return 0

  const maybeIndex = normalizedDeviceCount - 1
  if (maybeIndex >= maxBackupDeviceAnimationIndex)
    return maxBackupDeviceAnimationIndex

  return maybeIndex
}

export const getBackupDeviceAnimationSource = (
  userDeviceCount: number
): BackupDeviceAnimationSource =>
  backupDeviceAnimationSources[getBackupDeviceAnimationIndex(userDeviceCount)]

export const backupSplashAnimationSource = 'backup-vault-splash' as const
