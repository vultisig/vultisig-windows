// Define types and utilities for vault setup

import { TFunction } from 'i18next'

export type SetupVaultType = 'fast' | 'secure'

export const defaultSetupVaultType: SetupVaultType = 'secure'

type VaultPropKey = `prop_${0 | 1 | 2}`

const vaultPropKeys: VaultPropKey[] = ['prop_0', 'prop_1', 'prop_2']

export const getSetupVaultProperties = (
  type: SetupVaultType,
  t: TFunction
): string[] =>
  vaultPropKeys.map(propKey => t(`vault_setup_prop.${type}.${propKey}`))
