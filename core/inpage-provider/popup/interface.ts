import { VaultAppSession } from '@core/extension/storage/appSessions'
import { ITransactionPayload } from '@core/inpage-provider/popup/view/resolvers/sendTx/interfaces'
import { TonSignDataPayload } from '@core/ui/mpc/keysign/customMessage/ton/tonSignData'
import { VaultExport } from '@core/ui/vault/export/core'
import { ChainInfo } from '@keplr-wallet/types'
import {
  Chain,
  CosmosChain,
  EvmChain,
  OtherChain,
} from '@vultisig/core-chain/Chain'
import { Coin } from '@vultisig/core-chain/coin/Coin'
import { SerializedSigningOutput } from '@vultisig/core-chain/tw/signingOutput'
import { Tx } from '@vultisig/core-chain/tx'
import { Method } from '@vultisig/lib-utils/types/Method'
import { TypedDataDomain, TypedDataField } from 'ethers'

export type SignMessageType = 'connect' | 'default' | 'policy'

export type Eip712V4Payload = {
  primaryType: string
  domain: TypedDataDomain
  types: Record<string, Array<TypedDataField>>
  message: Record<string, unknown>
}

export const isEip712V4Payload = (value: unknown): value is Eip712V4Payload => {
  if (typeof value !== 'object' || value === null) return false
  if (!('primaryType' in value) || typeof value.primaryType !== 'string') {
    return false
  }
  if (
    !('domain' in value) ||
    typeof value.domain !== 'object' ||
    value.domain === null
  ) {
    return false
  }
  if (
    !('types' in value) ||
    typeof value.types !== 'object' ||
    value.types === null
  ) {
    return false
  }
  if (
    !('message' in value) ||
    typeof value.message !== 'object' ||
    value.message === null
  ) {
    return false
  }
  return true
}

/**
 * Chains whose dApp `sign_message` requests carry the message bytes to sign.
 * TON is absent: a raw TON signature over a 32-byte hash can authorize a
 * transfer, so TON requests come as `ton_proof` / `ton_sign_data` and the
 * popup builds the hash itself.
 */
export const rawSignMessageChains = [
  OtherChain.Solana,
  OtherChain.Sui,
  OtherChain.Tron,
  OtherChain.Polkadot,
  OtherChain.Bittensor,
  OtherChain.Cardano,
  OtherChain.Ripple,
] as const

type RawSignMessageChain = (typeof rawSignMessageChains)[number]

/** A dApp request to sign message bytes with a non-EVM chain key. */
export type RawSignMessageInput = {
  chain: RawSignMessageChain
  useTronHeader?: boolean
  isV2?: boolean
  // XRPL (GemWallet `signMessage`): when true `message` is raw hex,
  // otherwise it is UTF-8 text. Ignored by the other chains.
  isHex?: boolean
  message: string
}

/** A dApp request to sign a message, keyed by the signing method. */
export type SignMessageInput =
  | { eth_signTypedData_v4: { chain: EvmChain; message: Eip712V4Payload } }
  | {
      personal_sign: {
        chain: EvmChain
        message: string
        type: SignMessageType
        pluginId?: string
      }
    }
  | { sign_message: RawSignMessageInput }
  | {
      cosmos_sign_arbitrary: {
        chain: CosmosChain
        // base64-encoded arbitrary payload (ADR-36 MsgSignData `data`)
        data: string
      }
    }
  | {
      ton_proof: {
        chain: OtherChain.Ton
        // App domain from the dApp's manifest, which the dApp controls; the
        // popup shows it next to the real request origin.
        domain: string
        timestamp: number
        payload: string
      }
    }
  | {
      ton_sign_data: {
        chain: OtherChain.Ton
        timestamp: number
        payload: TonSignDataPayload
      }
    }

export type PopupInterface = {
  grantVaultAccess: Method<
    {
      preselectFastVault?: boolean
      chain?: Chain
      chains?: readonly Chain[]
      shouldGrantAccountAccess?: boolean
    },
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
  suggestKeplrChain: Method<{ chainInfo: ChainInfo }, boolean>
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
