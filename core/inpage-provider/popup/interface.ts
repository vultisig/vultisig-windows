import { VaultAppSession } from '@core/extension/storage/appSessions'
import { ITransactionPayload } from '@core/inpage-provider/popup/view/resolvers/sendTx/interfaces'
import { VaultExport } from '@core/ui/vault/export/core'
import { Chain, EvmChain, OtherChain } from '@vultisig/core-chain/Chain'
import { Coin } from '@vultisig/core-chain/coin/Coin'
import { SerializedSigningOutput } from '@vultisig/core-chain/tw/signingOutput'
import { Tx } from '@vultisig/core-chain/tx'
import { Method } from '@vultisig/lib-utils/types/Method'
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
        pluginId?: string
      }
    }
  | {
      sign_message: {
        chain:
          | OtherChain.Solana
          | OtherChain.Ton
          | OtherChain.Tron
          | OtherChain.Polkadot
          | OtherChain.Bittensor
          | OtherChain.Cardano
        useTronHeader?: boolean
        isV2?: boolean
        message: string
      }
    }

export type PopupInterface = {
  grantVaultAccess: Method<
    { preselectFastVault?: boolean; chain?: Chain },
    { appSession: VaultAppSession }
  >
  exportVaults: Method<{}, VaultExport[]>
  pluginReshare: Method<
    {
      pluginId: string
      dAppSessionId: string
      encryptionKeyHex: string
    },
    { success: boolean }
  >
  signMessage: Method<SignMessageInput, string>
  sendTx: Method<
    ITransactionPayload,
    (Omit<Tx, 'data'> & { data: SerializedSigningOutput })[]
  >
  watchAsset: Method<Coin<EvmChain>, boolean>
}

export type PopupMethod = keyof PopupInterface

export const mergeableInFlightPopupMethods: PopupMethod[] = ['grantVaultAccess']

export const authorizedPopupMethods = [
  'signMessage',
  'sendTx',
  'pluginReshare',
  'watchAsset',
] as const satisfies readonly PopupMethod[]

export type AuthorizedPopupMethod = (typeof authorizedPopupMethods)[number]
