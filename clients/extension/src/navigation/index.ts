import { Chain } from '@core/chain/Chain'
import { KeygenType } from '@core/mpc/keygen/KeygenType'
import { KeysignMessagePayload } from '@core/mpc/keysign/keysignPayload/KeysignMessagePayload'
import { KeygenMessage } from '@core/mpc/types/vultisig/keygen/v1/keygen_message_pb'
import { ReshareMessage } from '@core/mpc/types/vultisig/keygen/v1/reshare_message_pb'
import { KeysignMessage } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { addQueryParams } from '@lib/utils/query/addQueryParams'
import { withoutUndefinedFields } from '@lib/utils/record/withoutUndefinedFields'

export const appPaths = {
  root: '/',
  import: '/import',
  landing: '/landing',
  main: '/main',
  vaults: '/vaults',
  settings: {
    root: '/settings',
    currency: '/settings/currency',
    language: '/settings/language',
    vault: '/settings/vault',
    delete: '/settings/vault/delete',
    rename: '/settings/vault/rename',
  },
  uploadQr: '/upload-qr',
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
  address: { address: string }
  uploadQr: { title?: string }
  manageVaultChainCoins: { chain: Chain }
  vaultChainDetail: { chain: Chain }
  vaultChainCoinDetail: { chain: Chain; coin: string }
  send: { coin: string; address?: string }
  setupVault: { type?: 'secure' | 'fast' }
  swap: { coin: string }
  deposit: { coin: string }
  vaultFolder: { id: string }
  manageVaultFolder: { id: string }
}

export type AppPathState = {
  keysign: {
    keysignPayload: KeysignMessagePayload
  }
  fastKeysign: {
    keysignPayload: KeysignMessagePayload
  }
  joinKeysign: { vaultId: string; keysignMsg: KeysignMessage }
  joinKeygen: {
    keygenType: KeygenType
    keygenMsg: KeygenMessage | ReshareMessage
  }
  deeplink: {
    url: string
  }
  importVaultFromFile: {
    filePath: string
  }
}

type AppPathsWithParams = keyof AppPathParams

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
