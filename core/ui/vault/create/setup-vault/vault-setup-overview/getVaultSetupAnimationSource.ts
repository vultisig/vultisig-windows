const vaultSetupAnimationSources = [
  'vault-setup-1device',
  'vault-setup-2devices',
  'vault-setup-3devices',
  'vault-setup-4devices',
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
