import { addQueryParams } from '../lib/utils/query/addQueryParams';
import { withoutUndefinedFields } from '../lib/utils/record/withoutUndefinedFields';
import { Chain } from '../model/chain';
import { KeygenType } from '../vault/keygen/KeygenType';
import { SetupVaultType } from '../vault/setup/type/SetupVaultType';

export const appPaths = {
  importVault: '/vault/import',
  shareVault: '/vault/share',
  reshareVault: '/vault/reshare',
  reshareVaultSecure: '/vault/reshare/secure',
  reshareVaultFast: '/vault/reshare/fast',
  keysign: '/vault/keysign',
  fastKeysign: '/vault/keysign/fast',
  setupVault: '/vault/setup',
  setupSecureVault: '/vault/setup/secure',
  setupFastVault: '/vault/setup/fast',
  setupActiveVault: '/vault/setup/active',
  address: '/address',
  joinKeysign: '/join-keysign',
  root: '/',
  vaultSettings: '/vault/settings',
  uploadQr: '/vault/qr/upload',
  joinKeygen: '/join-keygen',
  vaults: '/vaults',
  manageVaults: '/vaults/manage',
  vault: '/vault',
  manageVaultChains: '/vault/chains',
  manageVaultChainCoins: '/vault/chains/coins',
  vaultChainDetail: '/vault/item/detail',
  vaultChainCoinDetail: '/vault/item/detail/coin',
  send: '/vault/send',
  editVault: '/vault/settings/vault-settings',
  vaultDetails: '/vault/settings/vault-settings/details',
  vaultBackup: '/vault/settings/vault-settings/backup-vault',
  vaultRename: '/vault/settings/vault-settings/rename-vault',
  vaultDelete: '/vault/settings/vault-settings/delete-vault',
  languageSettings: '/vault/settings/language-settings',
  currencySettings: '/vault/settings/currency-settings',
  checkUpdate: '/vault/settings/check-update',
  addressBook: '/vault/settings/address-book',
  defaultChains: '/vault/settings/default-chains',
  faq: '/vault/settings/faq',
  shareApp: '/vault/settings/share-app',
  privacyPolicy: '/vault/settings/privacy-policy',
  termsOfService: '/vault/settings/terms-of-service',
  vaultFAQ: '/vault/settings/faq',
  vaultItemSwap: '/vault/item/swap',
  registerForAirdrop: '/register-for-airdrop',
  onboarding: '/onboarding',
} as const;

type AppPaths = typeof appPaths;
export type AppPath = keyof AppPaths;

export type AppPathParams = {
  address: { address: string };
  joinKeysign: { vaultId: string; keysignMsg: string };
  keysign: { keysignPayload: string };
  fastKeysign: { keysignPayload: string };
  joinKeygen: { keygenType: KeygenType; keygenMsg: string };
  uploadQr: { title?: string };
  manageVaultChainCoins: { chain: Chain };
  vaultChainDetail: { chain: Chain };
  vaultChainCoinDetail: { chain: Chain; coin: string };
  send: { coin: string };
  setupVault: { type?: SetupVaultType };
  vaultItemSwap: Record<string, string>;
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
    return addQueryParams(basePath, withoutUndefinedFields(variables));
  } else {
    return basePath;
  }
}
