import { addQueryParams } from '@lib/utils/query/addQueryParams'
import { withoutUndefinedFields } from '@lib/utils/record/withoutUndefinedFields'

export const appPaths = {
  deleteVault: '/settings/vault/delete',
  languageSettings: '/settings/language',
  onboarding: '/onboarding',
  settings: '/settings',
  vaultSettings: '/settings/vault',
  connectedDapps: '/connected-dapps',
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
