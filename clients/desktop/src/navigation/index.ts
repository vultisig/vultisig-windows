import { addQueryParams } from '@lib/utils/query/addQueryParams'
import { withoutUndefinedFields } from '@lib/utils/record/withoutUndefinedFields'

export const appPaths = {
  importVaultFromFile: '/vault/import/file',
  shareVault: '/vault/share',
  migrateVault: '/vault/migrate',
  vaultSettings: '/vault/settings',
  manageVaults: '/vaults/manage',
  editVault: '/vault/settings/vault-settings',
  vaultBackup: '/vault/settings/vault-settings/backup-vault',
  vaultDelete: '/vault/settings/vault-settings/delete-vault',
  checkUpdate: '/vault/settings/check-update',
  addressBook: '/vault/settings/address-book',
  faq: '/vault/settings/faq',
  vaultFAQ: '/vault/settings/faq',
  signCustomMessage: '/vault/sign-custom-message',
  registerForAirdrop: '/register-for-airdrop',
  onboarding: '/onboarding',
  createVaultFolder: '/vault/create-folder',
  vaultFolder: '/vault/folder',
  manageVaultFolder: '/vault/folder/manage',
  deeplink: '/deeplink',
  dkls: '/dkls',
} as const

type AppPaths = typeof appPaths
export type AppPath = keyof AppPaths

export type AppPathParams = {
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
