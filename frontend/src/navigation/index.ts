import { colonVariablePattern } from '../lib/utils/template/colonTemplate';
import { injectVariables } from '../lib/utils/template/injectVariables';

export const addVaultPath = '/vault/add';
export const setupVaultPath = '/vault/setup';
export const importVaultPath = '/vault/import';
export const shareVaultPath = '/vault/share';

export const addressPath = '/address/:address';
export type AddressPathParams = { address: string };

export const makeAddressPath = (variables: AddressPathParams) =>
  injectVariables({
    template: addressPath,
    variables,
    variablePattern: colonVariablePattern,
  });
