import { addQueryParams } from '@lib/utils/query/addQueryParams'
import { withoutUndefinedFields } from '@lib/utils/record/withoutUndefinedFields'

export const appPaths = {
  root: '/',
  currencySettings: '/settings/currency',
  deleteVault: '/settings/vault/delete',
  landing: '/landing',
  languageSettings: '/settings/language',
  onboarding: '/onboarding',
  renameVault: '/settings/vault/rename',
  settings: '/settings',
  vaultSettings: '/settings/vault',
  manageChains: '/manage-chains',
} as const

type AppPaths = typeof appPaths
export type AppPath = keyof AppPaths

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

export function makeAppPath(path: AppPath, variables?: any): string {
  const basePath = resolveAppPath(path, appPaths)
  return variables
    ? addQueryParams(basePath, withoutUndefinedFields(variables))
    : basePath
}
