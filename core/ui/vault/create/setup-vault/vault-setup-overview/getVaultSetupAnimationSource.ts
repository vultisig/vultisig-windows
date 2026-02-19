const vaultSetupAnimationSources = [
  'vault_setup_device1',
  'vault_setup_device2',
  'vault_setup_device3',
  'vault_setup_device4',
] as const

type VaultSetupAnimationSource = (typeof vaultSetupAnimationSources)[number]

const maxVaultSetupAnimationIndex = vaultSetupAnimationSources.length - 1

const getVaultSetupAnimationIndex = (selectedDeviceCount: number): number => {
  const normalizedSelection = Math.floor(selectedDeviceCount)
  if (normalizedSelection <= 0) return 0
  if (normalizedSelection >= maxVaultSetupAnimationIndex)
    return maxVaultSetupAnimationIndex
  return normalizedSelection
}

export const getVaultSetupAnimationSource = (
  selectedDeviceCount: number
): VaultSetupAnimationSource =>
  vaultSetupAnimationSources[getVaultSetupAnimationIndex(selectedDeviceCount)]
