import { Chain } from '@core/chain/Chain'
import { addQueryParams } from '@lib/utils/query/addQueryParams'
import { withoutUndefinedFields } from '@lib/utils/record/withoutUndefinedFields'

export const appPaths = {
  newVault: '/new-vault',
  importVaultFromFile: '/vault/import/file',
  shareVault: '/vault/share',
  migrateVault: '/vault/migrate',
  address: '/address',
  root: '/',
  vaultSettings: '/vault/settings',
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
