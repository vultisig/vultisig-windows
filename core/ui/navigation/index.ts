import { KeygenType } from '@core/mpc/keygen/KeygenType'
import { KeysignMessagePayload } from '@core/mpc/keysign/keysignPayload/KeysignMessagePayload'
import { KeygenMessage } from '@core/mpc/types/vultisig/keygen/v1/keygen_message_pb'
import { ReshareMessage } from '@core/mpc/types/vultisig/keygen/v1/reshare_message_pb'
import { KeysignMessage } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { addQueryParams } from '@lib/utils/query/addQueryParams'
import { withoutUndefinedFields } from '@lib/utils/record/withoutUndefinedFields'

import { VaultSecurityType } from '../vault/VaultSecurityType'

export const corePaths = {
  vault: '/vault',
  joinKeygen: '/join-keygen',
  setupFastVault: '/vault/setup/fast',
  setupSecureVault: '/vault/setup/secure',
  setupVault: '/vault/setup',
  importVault: '/vault/import',
  keysign: '/vault/keysign',
  reshareVault: '/vault/reshare',
  reshareVaultFast: '/vault/reshare/fast',
  reshareVaultSecure: '/vault/reshare/secure',
  joinKeysign: '/join-keysign',
  uploadQr: '/vault/qr/upload',
  vaults: '/vaults',
} as const

type CorePaths = typeof corePaths
export type CorePath = keyof CorePaths

export type CorePathParams = {
  setupVault: { type?: VaultSecurityType }
  uploadQr: { title?: string }
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
