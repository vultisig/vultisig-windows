type VaultSetupVariantKey = 'fast' | 'secure2' | 'secure3' | 'secure4'

type VaultSetupVariant = {
  key: VaultSetupVariantKey
  securityType: 'fast' | 'secure'
}

export const getVaultSetupVariant = (
  selectedDeviceCount: number
): VaultSetupVariant => {
  if (selectedDeviceCount <= 0) {
    return { key: 'fast', securityType: 'fast' }
  }

  if (selectedDeviceCount === 1) {
    return { key: 'secure2', securityType: 'secure' }
  }

  if (selectedDeviceCount === 2) {
    return { key: 'secure3', securityType: 'secure' }
  }

  return { key: 'secure4', securityType: 'secure' }
}
