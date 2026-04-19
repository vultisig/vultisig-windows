/**
 * CIP-30 Cardano dApp-Wallet Web Bridge implementation.
 *
 * Exposes the wallet at `window.cardano.vultisig` so dApps (like
 * those that detect Lace) can discover and interact with Vultisig.
 *
 * @see https://cips.cardano.org/cip/CIP-30
 */
import VULTI_ICON_RAW_SVG from '@clients/extension/src/inpage/icon'
import { callBackground } from '@core/inpage-provider/background'
import { callPopup } from '@core/inpage-provider/popup'
import { PopupError } from '@core/inpage-provider/popup/error'
import { OtherChain } from '@vultisig/core-chain/Chain'
import { buildCardanoWitnessSet } from '@vultisig/core-chain/chains/cardano/cip30/buildCardanoWitnessSet'
import {
  buildCoseKey,
  buildCoseSign1,
  buildProtectedHeaderBytes,
  buildSigStructure,
} from '@vultisig/core-chain/chains/cardano/cip30/buildCoseStructures'
import { cardanoAddressBytes } from '@vultisig/core-chain/chains/cardano/cip30/cardanoAddressBytes'
import { cardanoTxBodyHash } from '@vultisig/core-chain/chains/cardano/cip30/cardanoTxBodyHash'
import { encodeCardanoUnspentOutput } from '@vultisig/core-chain/chains/cardano/cip30/encodeCardanoUnspentOutput'
import { encodeCardanoValue } from '@vultisig/core-chain/chains/cardano/cip30/encodeCardanoValue'
import { submitCardanoCbor } from '@vultisig/core-chain/chains/cardano/submit/submitCardanoCbor'
import { getCardanoExtendedUtxos } from '@vultisig/core-chain/chains/cardano/utxo/getCardanoExtendedUtxos'
import { attempt } from '@vultisig/lib-utils/attempt'
import { extractErrorMsg } from '@vultisig/lib-utils/error/extractErrorMsg'

import { EIP1193Error } from '../../background/handlers/errorHandler'
import { requestAccount } from './core/requestAccount'

// ========================= CIP-30 error factories =========================

const APIErrorCode = {
  InvalidRequest: -1,
  InternalError: -2,
  Refused: -3,
} as const

const TxSignErrorCode = {
  ProofGeneration: 1,
  UserDeclined: 2,
} as const

const DataSignErrorCode = {
  ProofGeneration: 1,
  AddressNotPK: 2,
  UserDeclined: 3,
} as const

const apiError = (code: number, info: string) => ({ code, info })

// ========================= Helpers =========================

const toHex = (bytes: Uint8Array): string => Buffer.from(bytes).toString('hex')
const fromHex = (hex: string): Uint8Array =>
  Uint8Array.from(Buffer.from(hex.replace(/^0x/i, ''), 'hex'))

type Paginate = { page: number; limit: number }

const paginateArray = <T>(items: T[], paginate?: Paginate): T[] => {
  if (!paginate) return items
  const { page, limit } = paginate
  if (
    !Number.isInteger(page) ||
    page < 0 ||
    !Number.isInteger(limit) ||
    limit <= 0
  ) {
    throw { code: 1, info: 'Invalid pagination', maxSize: items.length }
  }
  const maxPage = Math.max(0, Math.ceil(items.length / limit) - 1)
  if (page > maxPage) {
    throw { code: 1, info: 'Page out of range', maxSize: items.length }
  }
  return items.slice(page * limit, page * limit + limit)
}

/**
 * Ask the extension to MPC-sign raw bytes with the Cardano Ed25519 key.
 *
 * The `0x` prefix tells `getCustomMessageHex` to hex-decode these bytes rather
 * than UTF-8-encode the hex string — otherwise the ASCII of the hex digits
 * would be signed instead of the actual tx-body hash / COSE Sig_structure.
 */
const signWithCardanoKey = async (bytesToSign: Uint8Array): Promise<string> => {
  const hexMessage = `0x${toHex(bytesToSign)}`
  const signature = await callPopup({
    signMessage: {
      sign_message: {
        message: hexMessage,
        chain: OtherChain.Cardano,
      },
    },
  })
  return String(signature)
}

// ========================= API =========================

type CardanoCip30Extension = { cip: number }

const supportedCip30Extensions: CardanoCip30Extension[] = []

/** CIP-30 initial API injected at `window.cardano.vultisig`. */
export const createCardanoCip30InitialApi = () => ({
  name: 'Vultisig',
  icon: VULTI_ICON_RAW_SVG,
  apiVersion: '1.0.0',
  supportedExtensions: supportedCip30Extensions,

  isEnabled: async (): Promise<boolean> => {
    const result = await attempt(async () => {
      const { address } = await callBackground({
        getAccount: { chain: OtherChain.Cardano },
      })
      return !!address
    })
    if ('error' in result) return false
    return result.data
  },

  enable: async (): Promise<CardanoCip30Api> => {
    const result = await attempt(() => requestAccount(OtherChain.Cardano))
    if ('error' in result) {
      if (result.error instanceof EIP1193Error && result.error.code === 4001) {
        throw apiError(APIErrorCode.Refused, 'User refused connection')
      }
      throw apiError(
        APIErrorCode.InternalError,
        `enable failed: ${extractErrorMsg(result.error)}`
      )
    }
    const { address, publicKey } = result.data
    if (!address) {
      throw apiError(APIErrorCode.Refused, 'User refused connection')
    }
    return createCardanoCip30FullApi({ address, publicKeyHex: publicKey })
  },
})

type CardanoCip30Api = ReturnType<typeof createCardanoCip30FullApi>

type CreateCardanoCip30FullApiInput = {
  address: string
  publicKeyHex: string
}

/** CIP-30 full API returned by `enable()`. */
const createCardanoCip30FullApi = ({
  address,
  publicKeyHex,
}: CreateCardanoCip30FullApiInput) => {
  const addressRawBytes = cardanoAddressBytes(address)
  const addressHex = toHex(addressRawBytes)
  // WalletCore returns the extended Ed25519Cardano key (128 bytes).
  // CIP-30 vkey witnesses and COSE_Key need only the 32-byte spending key.
  const spendingKeyBytes = fromHex(publicKeyHex).slice(0, 32)

  const fetchUtxos = async () => {
    const result = await attempt(() => getCardanoExtendedUtxos(address))
    if ('error' in result) {
      throw apiError(
        APIErrorCode.InternalError,
        `Failed to fetch UTXOs: ${extractErrorMsg(result.error)}`
      )
    }
    return result.data
  }

  return {
    getExtensions: async (): Promise<CardanoCip30Extension[]> =>
      supportedCip30Extensions,

    getNetworkId: async (): Promise<number> => 1, // mainnet

    getUsedAddresses: async (paginate?: Paginate): Promise<string[]> =>
      paginateArray([addressHex], paginate),

    getUnusedAddresses: async (): Promise<string[]> => [],

    getChangeAddress: async (): Promise<string> => addressHex,

    getRewardAddresses: async (): Promise<string[]> => [],

    getBalance: async (): Promise<string> => {
      const utxos = await fetchUtxos()
      const lovelace = utxos.reduce((sum, u) => sum + u.amount, 0n)
      const assets = utxos.flatMap(u => u.assets)
      return toHex(encodeCardanoValue(lovelace, assets))
    },

    getUtxos: async (
      _amount?: string,
      paginate?: Paginate
    ): Promise<string[] | null> => {
      const utxos = await fetchUtxos()
      if (utxos.length === 0) return null
      return paginateArray(utxos, paginate).map(utxo =>
        toHex(
          encodeCardanoUnspentOutput({ utxo, addressBytes: addressRawBytes })
        )
      )
    },

    signTx: async (tx: string, _partialSign?: boolean): Promise<string> => {
      const result = await attempt(async () => {
        const txHash = cardanoTxBodyHash(tx)
        const signatureHex = await signWithCardanoKey(txHash)
        const witnessSet = buildCardanoWitnessSet({
          publicKey: spendingKeyBytes,
          signature: fromHex(signatureHex),
        })
        return toHex(witnessSet)
      })
      if ('error' in result) {
        if (result.error === PopupError.RejectedByUser) {
          throw apiError(TxSignErrorCode.UserDeclined, 'User declined signing')
        }
        throw apiError(
          TxSignErrorCode.ProofGeneration,
          `signTx failed: ${extractErrorMsg(result.error)}`
        )
      }
      return result.data
    },

    signData: async (
      addr: string,
      payload: string
    ): Promise<{ signature: string; key: string }> => {
      if (addr.replace(/^0x/i, '').toLowerCase() !== addressHex.toLowerCase()) {
        throw apiError(
          DataSignErrorCode.AddressNotPK,
          'signData address does not match the connected account'
        )
      }
      const result = await attempt(async () => {
        const addrBytes = fromHex(addr)
        const payloadBytes = fromHex(payload)
        const protectedBytes = buildProtectedHeaderBytes(addrBytes)
        const sigStructure = buildSigStructure(protectedBytes, payloadBytes)
        const signatureHex = await signWithCardanoKey(sigStructure)
        const coseSign1 = buildCoseSign1({
          addressBytes: addrBytes,
          payload: payloadBytes,
          signature: fromHex(signatureHex),
        })
        const coseKey = buildCoseKey({ publicKey: spendingKeyBytes })
        return { signature: toHex(coseSign1), key: toHex(coseKey) }
      })
      if ('error' in result) {
        if (result.error === PopupError.RejectedByUser) {
          throw apiError(
            DataSignErrorCode.UserDeclined,
            'User declined signing'
          )
        }
        throw apiError(
          DataSignErrorCode.ProofGeneration,
          `signData failed: ${extractErrorMsg(result.error)}`
        )
      }
      return result.data
    },

    submitTx: async (tx: string): Promise<string> => {
      const result = await attempt(() => submitCardanoCbor(tx))
      if ('error' in result) {
        throw apiError(
          APIErrorCode.InternalError,
          `submitTx failed: ${extractErrorMsg(result.error)}`
        )
      }
      const { txHash, errorMessage } = result.data
      if (txHash) return txHash
      throw apiError(
        APIErrorCode.InternalError,
        `submitTx failed: ${errorMessage ?? 'unknown broadcast failure'}`
      )
    },
  }
}
