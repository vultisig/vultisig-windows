import { range } from '../../../lib/utils/array/range';

const disabledSetupVaultTypes = ['fast', 'active'];
export const setupVaultTypes = ['fast', 'active', 'secure'].filter(
  type => !disabledSetupVaultTypes.includes(type)
);
export type SetupVaultType = (typeof setupVaultTypes)[number];

export const defaultSetupVaultType: SetupVaultType = 'fast';

export const getSetupVaultArt = (type: SetupVaultType) =>
  `/assets/images/${type}VaultSetup.svg`;

export const getSetupVaultProperties = (type: SetupVaultType) =>
  range(3).map(index => `${type}_vault_setup_prop_${index}`);

export const getSetupVaultPurpose = (type: SetupVaultType) =>
  `${type}_vault_purpose`;
