import { KeygenType } from '@core/mpc/keygen/KeygenType'
import { KeysignMessagePayload } from '@core/mpc/keysign/keysignPayload/KeysignMessagePayload'
import { KeygenMessage } from '@core/mpc/types/vultisig/keygen/v1/keygen_message_pb'
import { ReshareMessage } from '@core/mpc/types/vultisig/keygen/v1/reshare_message_pb'
import { KeysignMessage } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { VaultSecurityType } from '@core/ui/vault/VaultSecurityType'
import { addQueryParams } from '@lib/utils/query/addQueryParams'
import { withoutUndefinedFields } from '@lib/utils/record/withoutUndefinedFields'

export const corePaths = {
  currencySettings: '/settings/currency',
  defaultChains: '/settings/default-chains',
  importVault: '/vault/import',
  joinKeygen: '/join-keygen',
  joinKeysign: '/join-keysign',
  keysign: '/vault/keysign',
  languageSettings: '/settings/language',
  manageVaultChains: '/vault/chains/manage',
  newVault: '/vault/new',
  renameVault: '/settings/vault/rename',
  reshareVault: '/vault/reshare',
  reshareVaultFast: '/vault/reshare/fast',
  reshareVaultSecure: '/vault/reshare/secure',
  setupFastVault: '/vault/setup/fast',
  setupSecureVault: '/vault/setup/secure',
  setupVault: '/vault/setup',
  uploadQr: '/vault/qr/upload',
  vault: '/',
  vaultDetails: '/vault/settings/details',
  vaults: '/vaults',
  send: '/vault/send',
  swap: '/vault/item/swap',
} as const

type CorePaths = typeof corePaths

export type CorePath = keyof CorePaths

export type CorePathParams = {
  setupVault: { type?: VaultSecurityType }
  uploadQr: { title?: string }
  send: { coin: string; address?: string }
  swap: { coin: string }
}

export type CorePathState = {
  joinKeygen: {
    keygenType: KeygenType
    keygenMsg: KeygenMessage | ReshareMessage
  }
  keysign: {
    securityType: VaultSecurityType
    keysignPayload: KeysignMessagePayload
  }
  joinKeysign: { vaultId: string; keysignMsg: KeysignMessage }
}

export type CorePathsWithParams = keyof CorePathParams

export type CorePathsWithState = keyof CorePathState

export type CorePathsWithParamsAndState = Extract<
  CorePathsWithParams,
  CorePathsWithState
>
export type CorePathsWithOnlyParams = Exclude<
  CorePathsWithParams,
  CorePathsWithParamsAndState
>
export type CorePathsWithOnlyState = Exclude<
  CorePathsWithState,
  CorePathsWithParamsAndState
>
export type CorePathsWithNoParamsOrState = Exclude<
  CorePath,
  CorePathsWithParams | CorePathsWithState
>

export function makeCorePath<P extends keyof CorePathParams>(
  path: P,
  variables: CorePathParams[P]
): string

export function makeCorePath<P extends Exclude<CorePath, keyof CorePathParams>>(
  path: P
): string

export function makeCorePath(path: CorePath, variables?: any): string {
  const basePath = corePaths[path]
  if (variables) {
    return addQueryParams(basePath, withoutUndefinedFields(variables))
  } else {
    return basePath
  }
}
