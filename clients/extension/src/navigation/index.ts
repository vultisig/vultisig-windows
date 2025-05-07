import { Chain } from '@core/chain/Chain'
import { addQueryParams } from '@lib/utils/query/addQueryParams'
import { withoutUndefinedFields } from '@lib/utils/record/withoutUndefinedFields'

export const appPaths = {
  deleteVault: '/settings/vault/delete',
  onboarding: '/onboarding',
  settings: '/settings',
  vaultSettings: '/settings/vault',
  connectedDapps: '/connected-dapps',
  connectTab: '/tabs/connect',
  importTab: '/tabs/import',
  vaultsTab: '/tabs/vaults',
  transactionTab: '/tabs/transaction',
  vaultChainCoinDetail: '/vault/item/detail/coin',
  vaultChainDetail: '/vault/item/detail',
} as const

type AppPaths = typeof appPaths
export type AppPath = keyof AppPaths

export type AppPathParams = {
  manageVaultChainCoins: { chain: Chain }
  vaultChainDetail: { chain: Chain }
  vaultChainCoinDetail: { chain: Chain; coin: string }
}

export type AppPathsWithParams = keyof AppPathParams
export type AppPathsWithNoParamsOrState = Exclude<AppPath, AppPathsWithParams>

function resolveAppPath(path: string, obj: any): string {
  const parts = path.split('.')
  let result = obj
  for (const part of parts) {
    result = result?.[part]
  }
  if (typeof result !== 'string') {
    throw new Error(`Invalid path: ${path}`)
  }
  return result
}

export function makeAppPath<P extends keyof AppPathParams>(
  path: P,
  variables: AppPathParams[P]
): string
export function makeAppPath<P extends Exclude<AppPath, keyof AppPathParams>>(
  path: P
): string

export function makeAppPath(path: AppPath, variables?: any): string {
  const basePath = resolveAppPath(path, appPaths)
  return variables
    ? addQueryParams(basePath, withoutUndefinedFields(variables))
    : basePath
}
