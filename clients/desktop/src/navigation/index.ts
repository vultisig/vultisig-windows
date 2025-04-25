import { Chain } from '@core/chain/Chain'
import { KeysignMessage } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { corePaths } from '@core/ui/navigation'
import { addQueryParams } from '@lib/utils/query/addQueryParams'
import { withoutUndefinedFields } from '@lib/utils/record/withoutUndefinedFields'

export const appPaths = {
  ...corePaths,
  newVault: '/new-vault',
  importVaultFromFile: '/vault/import/file',
  shareVault: '/vault/share',
  migrateVault: '/vault/migrate',
  reshareVaultFast: '/vault/reshare/fast',
  setupActiveVault: '/vault/setup/active',
  address: '/address',
  joinKeysign: '/join-keysign',
  root: '/',
  vaultSettings: '/vault/settings',
  uploadQr: '/vault/qr/upload',
  vaults: '/vaults',
  manageVaults: '/vaults/manage',
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
  swap: '/vault/item/swap',
  signCustomMessage: '/vault/sign-custom-message',
  registerForAirdrop: '/register-for-airdrop',
  onboarding: '/onboarding',
  createVaultFolder: '/vault/create-folder',
  vaultFolder: '/vault/folder',
  manageVaultFolder: '/vault/folder/manage',
  deposit: '/vault/item/deposit',
  deeplink: '/deeplink',
  dkls: '/dkls',
} as const

type AppPaths = typeof appPaths
export type AppPath = keyof AppPaths

export type AppPathParams = {
  address: { address: string }
  uploadQr: { title?: string }
  manageVaultChainCoins: { chain: Chain }
  vaultChainDetail: { chain: Chain }
  vaultChainCoinDetail: { chain: Chain; coin: string }
  send: { coin: string; address?: string }
  swap: { coin: string }
  deposit: { coin: string }
  vaultFolder: { id: string }
  manageVaultFolder: { id: string }
}

export type AppPathState = {
  joinKeysign: { vaultId: string; keysignMsg: KeysignMessage }
  deeplink: {
    url: string
  }
  importVaultFromFile: {
    filePath: string
  }
}

export type AppPathsWithParams = keyof AppPathParams

export type AppPathsWithState = keyof AppPathState

export type AppPathsWithParamsAndState = Extract<
  AppPathsWithParams,
  AppPathsWithState
>
export type AppPathsWithOnlyParams = Exclude<
  AppPathsWithParams,
  AppPathsWithParamsAndState
>
export type AppPathsWithOnlyState = Exclude<
  AppPathsWithState,
  AppPathsWithParamsAndState
>
export type AppPathsWithNoParamsOrState = Exclude<
  AppPath,
  AppPathsWithParams | AppPathsWithState
>

export function makeAppPath<P extends keyof AppPathParams>(
  path: P,
  variables: AppPathParams[P]
): string
export function makeAppPath<P extends Exclude<AppPath, keyof AppPathParams>>(
  path: P
): string
export function makeAppPath(path: AppPath, variables?: any): string {
  const basePath = appPaths[path]
  if (variables) {
    return addQueryParams(basePath, withoutUndefinedFields(variables))
  } else {
    return basePath
  }
}
