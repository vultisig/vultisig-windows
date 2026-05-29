import { callBackground } from '@core/inpage-provider/background'
import { callPopup } from '@core/inpage-provider/popup'
import { TransactionDetails } from '@core/inpage-provider/popup/view/resolvers/sendTx/interfaces'
import {
  buildQBTCDirectPayload,
  QbtcDappCoin,
  QbtcDappFee,
} from '@core/ui/qbtc/dapp/buildQBTCDirectPayload'
import {
  encodeAnyMessage,
  QbtcDappMessage,
  UnsupportedQbtcMessageTypeError,
} from '@core/ui/qbtc/dapp/encodeAnyMessage'
import { qbtcChainId } from '@core/ui/qbtc/dapp/qbtcDirectConstants'
import { Chain } from '@vultisig/core-chain/Chain'
import { getQbtcAccountInfo } from '@vultisig/core-chain/chains/cosmos/qbtc/getQbtcAccountInfo'

import { EIP1193Error } from '../../background/handlers/errorHandler'

type QbtcSignAndBroadcastParams = {
  from: string
  messages: QbtcDappMessage[]
  memo?: string
  fee?: QbtcDappFee
}

const isCoin = (value: unknown): value is QbtcDappCoin =>
  !!value &&
  typeof value === 'object' &&
  typeof (value as QbtcDappCoin).denom === 'string' &&
  typeof (value as QbtcDappCoin).amount === 'string'

const isFee = (value: unknown): value is QbtcDappFee => {
  if (!value || typeof value !== 'object') return false
  const candidate = value as QbtcDappFee
  return (
    Array.isArray(candidate.amount) &&
    candidate.amount.every(isCoin) &&
    typeof candidate.gas === 'string'
  )
}

const isMessage = (value: unknown): value is QbtcDappMessage => {
  if (!value || typeof value !== 'object') return false
  const candidate = value as QbtcDappMessage
  return (
    typeof candidate.typeUrl === 'string' &&
    !!candidate.value &&
    typeof candidate.value === 'object'
  )
}

/**
 * Validates the raw `params[0]` payload sent to
 * `vultisig.qbtc.request({ method: 'sign_and_broadcast' })`. Returns the
 * narrowed shape or throws an `InvalidParams` EIP-1193 error.
 */
export const parseSignAndBroadcastParams = (
  params: readonly unknown[]
): QbtcSignAndBroadcastParams => {
  const [payload] = params
  if (!payload || typeof payload !== 'object') {
    throw new EIP1193Error('InvalidParams')
  }
  const { from, messages, memo, fee } = payload as Record<string, unknown>
  if (typeof from !== 'string' || !from) {
    throw new EIP1193Error('InvalidParams', 'Missing `from` address')
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new EIP1193Error(
      'InvalidParams',
      '`messages` must be a non-empty array'
    )
  }
  if (!messages.every(isMessage)) {
    throw new EIP1193Error(
      'InvalidParams',
      'Each message must be `{ typeUrl: string, value: object }`'
    )
  }
  if (memo !== undefined && typeof memo !== 'string') {
    throw new EIP1193Error('InvalidParams', '`memo` must be a string')
  }
  if (fee !== undefined && !isFee(fee)) {
    throw new EIP1193Error(
      'InvalidParams',
      '`fee` must be `{ amount: Coin[], gas: string }`'
    )
  }
  return {
    from,
    messages,
    memo,
    fee,
  }
}

const mldsaRequiredMessage =
  'QBTC requires an MLDSA-enabled vault. Enable MLDSA in Vultisig Developer Options and create a new vault.'

/**
 * Implements `vultisig.qbtc.request({ method: 'sign_and_broadcast' })`.
 *
 * Encodes the dApp-supplied Cosmos messages, fetches the live
 * accountNumber/sequence from the QBTC REST API, builds a SignDirect-style
 * payload (`bodyBytes` + `authInfoBytes`), and forwards it to the existing
 * approval popup. The MLDSA keysign pipeline signs the resulting SignDoc
 * and assembles + broadcasts the final transaction.
 */
export const handleQbtcSignAndBroadcast = async (
  params: QbtcSignAndBroadcastParams
): Promise<string> => {
  const { from, messages, memo, fee } = params

  const { address, publicKey: hexPublicKey } = await callBackground({
    getAccount: { chain: Chain.QBTC },
  })
  if (!address || !hexPublicKey) {
    throw new EIP1193Error('Unauthorized', mldsaRequiredMessage)
  }
  if (address !== from) {
    throw new EIP1193Error(
      'Unauthorized',
      `Connected QBTC account does not match \`from\` (${from})`
    )
  }

  // Pre-validate typeUrls so we fail fast (4200) instead of inside the popup.
  for (const message of messages) {
    try {
      encodeAnyMessage(message)
    } catch (error) {
      if (error instanceof UnsupportedQbtcMessageTypeError) {
        throw new EIP1193Error('UnsupportedMethod', error.message)
      }
      throw error
    }
  }

  const accountInfo = await getQbtcAccountInfo({ address: from })

  const { bodyBytes, authInfoBytes } = buildQBTCDirectPayload({
    messages,
    memo,
    fee,
    hexPublicKey,
    sequence: BigInt(accountInfo.sequence),
  })

  const transactionDetails: TransactionDetails = {
    asset: { ticker: 'QBTC' },
    from,
    memo,
    directPayload: {
      bodyBytes,
      authInfoBytes,
      chainId: qbtcChainId,
      accountNumber: String(accountInfo.accountNumber),
    },
  }

  const [{ hash }] = await callPopup(
    {
      sendTx: {
        keysign: {
          transactionDetails,
          chain: Chain.QBTC,
        },
      },
    },
    {
      account: from,
    }
  )

  return hash
}
