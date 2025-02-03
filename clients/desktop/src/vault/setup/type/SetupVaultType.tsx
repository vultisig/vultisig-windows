import { range } from '@lib/utils/array/range';

export const setupVaultTypes = ['fast', 'secure'] as const;

export type SetupVaultType = (typeof setupVaultTypes)[number];

export const defaultSetupVaultType: SetupVaultType = 'secure';

export const getSetupVaultArt = (type: SetupVaultType) =>
  `/assets/images/${type}VaultSetup.svg`;

export const getSetupVaultProperties = (type: SetupVaultType) =>
  range(3).map(index => `${type}_vault_setup_prop_${index}`);

export const getSetupVaultPurpose = (type: SetupVaultType) =>
  `${type}_vault_purpose`;
