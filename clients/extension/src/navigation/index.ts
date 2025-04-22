import { VaultSecurityType } from '@core/ui/vault/VaultSecurityType'
import { addQueryParams } from '@lib/utils/query/addQueryParams'
import { withoutUndefinedFields } from '@lib/utils/record/withoutUndefinedFields'

export const appPaths = {
  root: '/',
  importQR: '/import/qr',
  currencySettings: '/settings/currency',
  deleteVault: '/settings/vault/delete',
  landing: '/landing',
  languageSettings: '/settings/language',
  main: '/main',
  onboarding: '/onboarding',
  renameVault: '/settings/vault/rename',
  settings: '/settings',
  vaults: '/vaults',
  vaultSettings: '/settings/vault',
  setupSecureVault: '/vault/setup/secure',
} as const

type AppPaths = typeof appPaths
type Prev = [never, 0, 1, 2, 3, 4, 5]

type DotNestedKeys<T, D extends number = 5> = [D] extends [never]
  ? never
  : T extends object
    ? {
        [K in keyof T & string]: T[K] extends string
          ? K
          : T[K] extends object
            ? `${K}.${DotNestedKeys<T[K], Prev[D]>}`
            : K
      }[keyof T & string]
    : ''

export type AppPath = DotNestedKeys<AppPaths>

// TODO: to change as required in the extension
export type AppPathParams = {
  importQR: { title?: string }
  importFile: { title?: string }
  setupVault: { type?: VaultSecurityType }
  uploadQr: { title?: string }
  import: { from?: string }
}

export type AppPathState = {}

export type AppPathsWithParams = keyof AppPathParams

type AppPathsWithState = keyof AppPathState

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
