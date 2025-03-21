// Define types and utilities for vault setup

import { TFunction } from 'i18next'

export const setupVaultTypes = ['fast', 'secure'] as const

export type SetupVaultType = (typeof setupVaultTypes)[number]

export const defaultSetupVaultType: SetupVaultType = 'secure'

export const getSetupVaultArt = (type: SetupVaultType) =>
  `/assets/images/${type}VaultSetup.svg`

export type VaultPropKey = `prop_${0 | 1 | 2}`

export const vaultPropKeys: VaultPropKey[] = ['prop_0', 'prop_1', 'prop_2']

export const getSetupVaultProperties = (
  type: SetupVaultType,
  t: TFunction
): string[] =>
  vaultPropKeys.map(propKey => t(`vault_setup_prop.${type}.${propKey}`))

export const getSetupVaultPurpose = (
  type: SetupVaultType,
  t: TFunction
): string => t(`vault_setup_prop.${type}.purpose`)

export const getSetupVaultTitle = (
  type: SetupVaultType,
  t: TFunction
): string => t(`vault_setup_prop.${type}.title`)
