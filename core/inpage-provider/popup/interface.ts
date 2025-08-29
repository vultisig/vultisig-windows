import { EvmChain, OtherChain } from '@core/chain/Chain'
import { Tx } from '@core/chain/tx'
import { VaultAppSession } from '@core/extension/storage/appSessions'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { VaultExport } from '@core/ui/vault/export/core'
import { Serialized } from '@lib/extension/serialization'
import { Method } from '@lib/utils/types/Method'
import { TypedDataDomain, TypedDataField } from 'ethers'

export type Eip712V4Payload = {
  domain: TypedDataDomain
  types: Record<string, Array<TypedDataField>>
  message: Record<string, unknown>
}

export type SignMessageInput =
  | {
      eth_signTypedData_v4: {
        chain: EvmChain
        message: Eip712V4Payload
      }
    }
  | {
      personal_sign: {
        chain: EvmChain
        message: string
        bytesCount: number
      }
    }
  | {
      sign_message: {
        chain: OtherChain.Solana
        message: string
      }
    }

export type PopupInterface = {
  grantVaultAccess: Method<{}, { appSession: VaultAppSession }>
  exportVaults: Method<{}, VaultExport[]>
  pluginReshare: Method<{ pluginId: string }, { joinUrl: string }>
  signMessage: Method<SignMessageInput, string>
  sendTx: Method<{ keysignPayload: KeysignPayload }, { txs: Serialized<Tx>[] }>
}

export type PopupMethod = keyof PopupInterface

export const mergeableInFlightPopupMethods: PopupMethod[] = ['grantVaultAccess']

export const authorizedPopupMethods = [
  'signMessage',
  'pluginReshare',
] as const satisfies readonly PopupMethod[]

export type AuthorizedPopupMethod = (typeof authorizedPopupMethods)[number]
