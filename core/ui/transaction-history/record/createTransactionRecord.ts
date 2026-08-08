import { Chain } from '@vultisig/core-chain/Chain'
import { decodeCowSwapKeysignData } from '@vultisig/core-chain/swap/general/cowswap/keysign/cowSwapKeysignData'
import { getThorchainCancelMemoAsset } from '@vultisig/core-chain/swap/native/thorchainMemoAsset'
import { getBlockExplorerUrl } from '@vultisig/core-chain/utils/getBlockExplorerUrl'
import {
  getKeysignLimitSwapOrder,
  KeysignLimitSwapOrder,
} from '@vultisig/core-mpc/keysign/swap/getKeysignLimitSwapOrder'
import { getKeysignSwapPayload } from '@vultisig/core-mpc/keysign/swap/getKeysignSwapPayload'
import { getKeysignSwapProviderName } from '@vultisig/core-mpc/keysign/swap/getKeysignSwapProviderName'
import { KeysignSwapPayload } from '@vultisig/core-mpc/keysign/swap/KeysignSwapPayload'
import { getKeysignChain } from '@vultisig/core-mpc/keysign/utils/getKeysignChain'
import { getKeysignCoin } from '@vultisig/core-mpc/keysign/utils/getKeysignCoin'
import { getSwapTrackingUrl } from '@vultisig/core-mpc/swap/utils/getSwapTrackingUrl'
import { fromCommCoin } from '@vultisig/core-mpc/types/utils/commCoin'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { attempt } from '@vultisig/lib-utils/attempt'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'

import { getThorchainAssetTicker } from '../../mpc/keysign/join/tx/thorchainAssetTicker'
import { toThorchainFixedPoint } from '../../vault/swap/limit/amount'
import {
  LimitSwapTransactionData,
  LimitSwapTransactionRecord,
  SendTransactionData,
  SendTransactionRecord,
  SwapTransactionData,
  SwapTransactionRecord,
  TransactionRecord,
  TrustLineTransactionData,
  TrustLineTransactionRecord,
} from '../core'
import { getPrimaryCosmosMessageTypeUrl } from './getPrimaryCosmosMessageTypeUrl'

type CreateTransactionRecordInput = {
  payload: KeysignPayload
  txHash: string
  vaultId: string
}

const emptyLogoFallback = ''

type CreateLimitSwapDataInput = {
  payload: KeysignPayload
  order: KeysignLimitSwapOrder
}

const createLimitSwapData = ({
  payload,
  order,
}: CreateLimitSwapDataInput): LimitSwapTransactionData => {
  const coin = getKeysignCoin(payload)

  return {
    fromAddress: coin.address,
    fromToken: coin.ticker,
    fromTokenLogo: coin.logo ?? emptyLogoFallback,
    fromTokenId: coin.id,
    fromChain: coin.chain,
    fromDecimals: coin.decimals,
    fromAmount: payload.toAmount,
    buyTicker: getThorchainAssetTicker(order.targetAsset),
    targetAsset: order.targetAsset,
    minimumReceived: order.minimumReceivedDecimal,
    destinationAddress: order.destinationAddress,
    expiryHours: order.expiryHours,
    memo: shouldBePresent(payload.memo, 'limit order memo'),
    orderStatus: 'pending',
    ...createSignedLimitOrderIdentity({ payload, order }),
  }
}

/**
 * The order's identity in the exact form a future cancel needs, captured now
 * because now is when it is known exactly.
 *
 * A cancel addresses an order by `(assets, deposit, trade target)` — never by tx
 * hash — so approximations do not degrade gracefully: a value one unit out lands
 * in a different bucket and the cancel closes nothing. The source amount is
 * rescaled into THORChain's 1e8 here, matching what the queue will report back,
 * so eligibility's cross-check compares like with like.
 *
 * Recorded on a best-effort basis. A source asset this SDK cannot spell is not a
 * reason to fail a placement that already broadcast — the order still rests, and
 * the queue reports its identity back on the first poll, which is the same path
 * an order placed before cancelling existed takes.
 */
const createSignedLimitOrderIdentity = ({
  payload,
  order,
}: CreateLimitSwapDataInput): Partial<LimitSwapTransactionData> => {
  const coin = getKeysignCoin(payload)

  const signedSourceAsset = attempt(() =>
    getThorchainCancelMemoAsset({
      chain: coin.chain,
      id: coin.id,
      ticker: coin.ticker,
    })
  )

  return {
    ...('data' in signedSourceAsset
      ? { signedSourceAsset: signedSourceAsset.data }
      : {}),
    signedSourceAmount: toThorchainFixedPoint({
      amount: BigInt(payload.toAmount),
      decimals: coin.decimals,
    }).toString(),
    signedTradeTarget: order.limit.toString(),
  }
}

const createSendData = (payload: KeysignPayload): SendTransactionData => {
  const coin = getKeysignCoin(payload)

  return {
    fromAddress: coin.address,
    toAddress: payload.toAddress,
    amount: payload.toAmount,
    token: coin.ticker,
    tokenLogo: coin.logo ?? emptyLogoFallback,
    tokenId: coin.id,
    decimals: coin.decimals,
    memo: payload.memo || undefined,
    messageTypeUrl: getPrimaryCosmosMessageTypeUrl(payload),
  }
}

/**
 * Whether this payload opens or modifies an XRPL trust line.
 *
 * Mirrors how the signer decides: an issued-currency coin on a Ripple payload
 * builds a TrustSet, while a verbatim dApp transaction (`signRipple`) is signed
 * as supplied and never rebuilt from the coin. Once every platform sets
 * `RippleSpecific.transaction_type`, this can prefer that field instead of
 * inferring it — the shapes agree either way for anything we originate.
 */
const isRippleTrustSetPayload = (payload: KeysignPayload): boolean => {
  const { coin } = payload

  return (
    payload.signData.case !== 'signRipple' &&
    !!coin &&
    coin.chain === Chain.Ripple &&
    !coin.isNativeToken &&
    !!coin.contractAddress
  )
}

const createTrustLineData = (
  payload: KeysignPayload
): TrustLineTransactionData => {
  const coin = getKeysignCoin(payload)

  return {
    fromAddress: coin.address,
    // The TrustSet names the issuer, which the payload carries as `toAddress`
    // only because a keysign payload has nowhere else to put it.
    issuer: payload.toAddress,
    token: coin.ticker,
    tokenLogo: coin.logo ?? emptyLogoFallback,
    tokenId: shouldBePresent(coin.id, 'trust line token id'),
    limit: payload.toAmount,
    decimals: coin.decimals,
  }
}

const coinFromCommCoin = (coin: Parameters<typeof fromCommCoin>[0]) => {
  const accountCoin = fromCommCoin(coin)
  return {
    token: accountCoin.ticker,
    tokenLogo: accountCoin.logo ?? emptyLogoFallback,
    tokenId: accountCoin.id,
    chain: accountCoin.chain,
    decimals: accountCoin.decimals,
  }
}

const createSwapData = (payload: KeysignPayload): SwapTransactionData => {
  const swapPayload = shouldBePresent(
    getKeysignSwapPayload(payload),
    'swap payload for swap transaction'
  )

  const provider = getKeysignSwapProviderName(swapPayload)

  return matchRecordUnion(swapPayload, {
    native: (native): SwapTransactionData => {
      const from = coinFromCommCoin(
        shouldBePresent(native.fromCoin, 'native swap fromCoin')
      )
      const to = coinFromCommCoin(
        shouldBePresent(native.toCoin, 'native swap toCoin')
      )

      return {
        fromToken: from.token,
        fromAmount: native.fromAmount,
        fromChain: from.chain,
        fromTokenLogo: from.tokenLogo,
        fromTokenId: from.tokenId,
        fromDecimals: from.decimals,
        toToken: to.token,
        toAmount: native.toAmountDecimal,
        toAmountLimit: native.toAmountLimit,
        toChain: to.chain,
        toTokenLogo: to.tokenLogo,
        toTokenId: to.tokenId,
        toDecimals: to.decimals,
        provider,
        route: `${from.token} → ${to.token}`,
      }
    },
    general: (general): SwapTransactionData => {
      const from = coinFromCommCoin(
        shouldBePresent(general.fromCoin, 'general swap fromCoin')
      )
      const to = coinFromCommCoin(
        shouldBePresent(general.toCoin, 'general swap toCoin')
      )

      // CowSwap orders carry their orderbook API base in the (otherwise unused
      // for off-chain orders) tx.data field — surface it so the status poller
      // can poll the order by UID.
      const cowSwapData =
        general.provider === 'cowswap'
          ? decodeCowSwapKeysignData(general.quote?.tx?.data ?? '')
          : null

      return {
        fromToken: from.token,
        fromAmount: general.fromAmount,
        fromChain: from.chain,
        fromTokenLogo: from.tokenLogo,
        fromTokenId: from.tokenId,
        fromDecimals: from.decimals,
        toToken: to.token,
        toAmount: general.toAmountDecimal,
        toChain: to.chain,
        toTokenLogo: to.tokenLogo,
        toTokenId: to.tokenId,
        toDecimals: to.decimals,
        provider,
        route: `${from.token} → ${to.token}`,
        ...(cowSwapData ? { cowSwapOrderApiBase: cowSwapData.apiBase } : {}),
      }
    },
  })
}

/** Returns the chain associated with transaction status and record metadata. */
const getSwapExplorerChain = (
  swapPayload: KeysignSwapPayload,
  sourceChain: Chain
): Chain =>
  matchRecordUnion(swapPayload, {
    native: ({ chain }) => chain,
    general: () => sourceChain,
  })

export const createTransactionRecord = ({
  payload,
  txHash,
  vaultId,
}: CreateTransactionRecordInput): TransactionRecord => {
  const sourceChain = getKeysignChain(payload)
  const timestamp = new Date().toISOString()
  const id = `${txHash}-${timestamp}`

  const swapPayload = getKeysignSwapPayload(payload)
  const isSwapTx = swapPayload != null

  const explorerChain = isSwapTx
    ? getSwapExplorerChain(swapPayload, sourceChain)
    : sourceChain

  const explorerUrl =
    swapPayload != null
      ? getSwapTrackingUrl({
          swapPayload,
          txHash,
          sourceChain,
        })
      : getBlockExplorerUrl({
          chain: explorerChain,
          entity: 'tx',
          value: txHash,
        })

  const base = {
    id,
    vaultId,
    chain: explorerChain,
    timestamp,
    txHash,
    explorerUrl,
    fiatValue: '',
    status: 'broadcasted' as const,
  }

  // Checked before the swap-payload branch: only ERC20-sourced limit orders
  // carry a swap payload, so branching on it would record a RUNE or native-gas
  // order as a plain send. The memo identifies the order on every source branch.
  const limitOrder = getKeysignLimitSwapOrder(payload)
  if (limitOrder) {
    return {
      ...base,
      chain: sourceChain,
      explorerUrl: getBlockExplorerUrl({
        chain: sourceChain,
        entity: 'tx',
        value: txHash,
      }),
      type: 'limitSwap',
      data: createLimitSwapData({ payload, order: limitOrder }),
    } satisfies LimitSwapTransactionRecord
  }

  if (isSwapTx) {
    return {
      ...base,
      type: 'swap',
      data: createSwapData(payload),
    } satisfies SwapTransactionRecord
  }

  // Before the send fallback: a TrustSet transfers nothing, and its amount is
  // the line's LIMIT. Recording it as a send renders that ceiling as an
  // enormous outgoing payment to the issuer of a token that never moved.
  if (isRippleTrustSetPayload(payload)) {
    return {
      ...base,
      type: 'trustLine',
      data: createTrustLineData(payload),
    } satisfies TrustLineTransactionRecord
  }

  return {
    ...base,
    type: 'send',
    data: createSendData(payload),
  } satisfies SendTransactionRecord
}
