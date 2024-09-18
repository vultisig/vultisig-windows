import { colonVariablePattern } from '../lib/utils/template/colonTemplate';
import { injectVariables } from '../lib/utils/template/injectVariables';

export const appPaths = {
  addVault: '/vault/add',
  setupVault: '/vault/setup',
  importVault: '/vault/import',
  shareVault: '/vault/share',
  keysign: '/vault/keysign',
  address: '/address/:address',
  joinKeysign: '/join-keysign/:publicKeyECDSA/:sessionID',
  root: '/',
  vaultSettings: '/vault/settings',
  uploadQr: '/vault/qr/upload',
  joinKeygen: '/join-keygen/:keygenType/:sessionID',
  vaultList: '/vault/list',
  manageVaultChains: '/vault/chains',
  manageVaultChainCoins: '/vault/chains/:chain',
  vaultChainDetail: '/vault/item/detail/:chain',
  vaultChainCoinDetail: '/vault/item/detail/:chain/:coin',
  vaultItemSend: '/vault/item/send/:chain',
  verifyTransaction: '/vault/item/send/verify',
  editVault: '/vault/settings/vault-settings',
  vaultDetails: '/vault/settings/vault-settings/details',
  vaultBackup: '/vault/settings/vault-settings/backup-vault',
  vaultRename: '/vault/settings/vault-settings/rename-vault',
  vaultReshare: '/vault/settings/vault-settings/reshare-vault',
  vaultDelete: '/vault/settings/vault-settings/delete-vault',
  languageSettings: '/vault/settings/language-settings',
  currencySettings: '/vault/settings/currency-settings',
  addressBook: '/vault/settings/address-book',
  defaultChains: '/vault/settings/default-chains',
  faq: '/vault/settings/faq',
  shareApp: '/vault/settings/share-app',
  privacyPolicy: '/vault/settings/privacy-policy',
  termsOfService: '/vault/settings/terms-of-service',
  vaultFAQ: '/vault/settings/faq',
} as const;

type AppPaths = typeof appPaths;
export type AppPath = keyof AppPaths;

export type AppPathParams = {
  address: { address: string };
  joinKeysign: { publicKeyECDSA: string; sessionID: string };
  joinKeygen: { keygenType: string; sessionID: string };
  manageVaultChainCoins: { chain: string };
  vaultChainDetail: { chain: string };
  vaultChainCoinDetail: { chain: string; coin: string };
  vaultItemSend: { chain: string };
};

export type AppPathsWithParams = keyof AppPathParams;

export function makeAppPath<P extends keyof AppPathParams>(
  path: P,
  variables: AppPathParams[P]
): string;
export function makeAppPath<P extends Exclude<AppPath, keyof AppPathParams>>(
  path: P
): string;
export function makeAppPath(path: AppPath, variables?: any): string {
  const template = appPaths[path];
  if (variables) {
    return injectVariables({
      template,
      variables,
      variablePattern: colonVariablePattern,
    });
  } else {
    return template;
  }
}
