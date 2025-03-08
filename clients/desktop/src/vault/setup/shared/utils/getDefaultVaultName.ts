import { SetupVaultType } from '../../type/SetupVaultType'

export const getDefaultVaultName = (
  vaultType: SetupVaultType,
  existingNames: string[]
): string => {
  const prefix = vaultType === 'secure' ? 'Secure Vault' : 'Fast Vault'

  let counter = existingNames.length + 1
  let vaultName

  do {
    vaultName = `${prefix} #${counter}`
    counter++
  } while (existingNames.includes(vaultName))

  return vaultName
}
