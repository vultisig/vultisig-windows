import { TFunction } from 'i18next'

export type VaultSecurityType = 'fast' | 'secure'

export const defaultVaultSecurityType: VaultSecurityType = 'fast'

const vaultSecurityPropKeys = ['prop_0', 'prop_1', 'prop_2'] as const

export const getVaultSecurityProperties = (
  type: VaultSecurityType,
  t: TFunction
): string[] =>
  vaultSecurityPropKeys.map(propKey => t(`vault_setup_prop.${type}.${propKey}`))
