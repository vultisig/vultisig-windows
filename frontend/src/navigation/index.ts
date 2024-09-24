import { addQueryParams } from '../lib/utils/query/addQueryParams';
import { KeygenType } from '../vault/keygen/KeygenType';

export const appPaths = {
  addVault: '/vault/add',
  setupVaultOptions: '/vault/setup/option',
  setupVaultInitiatingDevice: '/vault/setup/initiating-device',
  importVault: '/vault/import',
  shareVault: '/vault/share',
  keysign: '/vault/keysign',
  address: '/address',
  joinKeysign: '/join-keysign',
  root: '/',
  vaultSettings: '/vault/settings',
  uploadQr: '/vault/qr/upload',
  joinKeygen: '/join-keygen',
  vaultList: '/vault/list',
  manageVaultChains: '/vault/chains',
  manageVaultChainCoins: '/vault/chains/coins',
  vaultChainDetail: '/vault/item/detail',
  vaultChainCoinDetail: '/vault/item/detail/coin',
  vaultItemSend: '/vault/item/send',
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
  joinKeygen: { keygenType: KeygenType; keygenMsg: string };
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
  const basePath = appPaths[path];
  if (variables) {
    return addQueryParams(basePath, variables);
  } else {
    return basePath;
  }
}
