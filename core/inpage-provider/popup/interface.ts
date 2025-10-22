import { EvmChain, OtherChain } from '@core/chain/Chain'
import { SerializedSigningOutput } from '@core/chain/tw/signingOutput'
import { Tx } from '@core/chain/tx'
import { VaultAppSession } from '@core/extension/storage/appSessions'
import { ITransactionPayload } from '@core/inpage-provider/popup/view/resolvers/sendTx/interfaces'
import { VaultExport } from '@core/ui/vault/export/core'
import { Method } from '@lib/utils/types/Method'
import { TypedDataDomain, TypedDataField } from 'ethers'

export type SignMessageType = 'connect' | 'default' | 'policy'

export type Eip712V4Payload = {
  domain: TypedDataDomain
  types: Record<string, Array<TypedDataField>>
  message: Record<string, unknown>
}

export type SignMessageInput =
  | { eth_signTypedData_v4: { chain: EvmChain; message: Eip712V4Payload } }
  | {
      personal_sign: {
        bytesCount: number
        chain: EvmChain
        message: string
        type: SignMessageType
      }
    }
  | {
      sign_message: {
        chain: OtherChain.Solana | OtherChain.Tron
        useTronHeader?: boolean
        message: string
      }
    }

export type PopupInterface = {
  grantVaultAccess: Method<{}, { appSession: VaultAppSession }>
  exportVaults: Method<{}, VaultExport[]>
  pluginReshare: Method<{ pluginId: string }, { joinUrl: string }>
  signMessage: Method<SignMessageInput, string>
  sendTx: Method<
    ITransactionPayload,
    Omit<Tx, 'data'> & { data: SerializedSigningOutput }
  >
}

export type PopupMethod = keyof PopupInterface

export const mergeableInFlightPopupMethods: PopupMethod[] = ['grantVaultAccess']

export const authorizedPopupMethods = [
  'signMessage',
  'sendTx',
  'pluginReshare',
] as const satisfies readonly PopupMethod[]

export type AuthorizedPopupMethod = (typeof authorizedPopupMethods)[number]
