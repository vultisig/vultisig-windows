import { range } from '../../../lib/utils/array/range';

const allSetupVaultTypes = ['fast', 'active', 'secure'] as const;
const disabledSetupVaultTypes = new Set(['fast', 'active']);
export const setupVaultTypes = allSetupVaultTypes.filter(
  type => !disabledSetupVaultTypes.has(type)
);
export type SetupVaultType = (typeof setupVaultTypes)[number];

export const defaultSetupVaultType: SetupVaultType = 'secure';

export const getSetupVaultArt = (type: SetupVaultType) =>
  `/assets/images/${type}VaultSetup.svg`;

export const getSetupVaultProperties = (type: SetupVaultType) =>
  range(3).map(index => `${type}_vault_setup_prop_${index}`);

export const getSetupVaultPurpose = (type: SetupVaultType) =>
  `${type}_vault_purpose`;
