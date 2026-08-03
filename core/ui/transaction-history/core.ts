import { Chain } from '@vultisig/core-chain/Chain'
import { limitSwapOrderStatuses } from '@vultisig/core-chain/swap/native/limitSwapOrderStatus'

export const transactionRecordTypes = ['send', 'swap', 'limitSwap'] as const
export type TransactionRecordType = (typeof transactionRecordTypes)[number]

export const transactionRecordStatuses = [
  'broadcasted',
  'pending',
  'confirmed',
  'failed',
] as const
export type TransactionRecordStatus = (typeof transactionRecordStatuses)[number]

type TransactionRecordBase = {
  id: string
  vaultId: string
  type: TransactionRecordType
  status: TransactionRecordStatus
  chain: Chain
  timestamp: string
  txHash: string
  explorerUrl: string
  fiatValue: string
}

export type SendTransactionData = {
  fromAddress: string
  toAddress: string
  amount: string
  token: string
  tokenLogo: string
  tokenId?: string
  decimals: number
  feeEstimate?: string
  memo?: string
  /**
   * For Cosmos SDK chains (QBTC dApp txs and in-wallet staking), the typeUrl of
   * the primary (first) message in the signed `TxBody`, e.g.
   * `/cosmos.staking.v1beta1.MsgDelegate`. Drives the history tag label so a
   * delegate/vote/claim tx isn't mislabeled as a plain "Send". Undefined for
   * non-Cosmos sends, which keep the default "Send" label.
   */
  messageTypeUrl?: string
}

export type SwapTransactionData = {
  fromToken: string
  fromAmount: string
  fromChain: Chain
  fromTokenLogo: string
  fromTokenId?: string
  fromDecimals: number
  toToken: string
  toAmount: string
  /** Guaranteed on-chain minimum output ("min. payout"). Present only for
   * native (THORChain/MayaChain) swaps, whose signed payload carries a real
   * `to_amount_limit`. General aggregator swaps expose no separate floor. */
  toAmountLimit?: string
  toChain: Chain
  toTokenLogo: string
  toTokenId?: string
  toDecimals: number
  provider?: string
  route?: string
  /** Present only for CowSwap RFQ orders. The orderbook API base lets the
   * status poller poll the off-chain order by UID (the record's `txHash`)
   * instead of a chain tx hash. Once the order settles, the poller replaces
   * `txHash` with the on-chain settlement hash. */
  cowSwapOrderApiBase?: string
}

export type SendTransactionRecord = TransactionRecordBase & {
  type: 'send'
  data: SendTransactionData
}

export type SwapTransactionRecord = TransactionRecordBase & {
  type: 'swap'
  data: SwapTransactionData
}

/**
 * The SDK's shared order lifecycle plus `rejected` — a deposit THORChain's
 * handler refused outright. Only visible via the cosmos tx result (a rejected
 * `MsgDeposit` never produces a Midgard action), and app-side because the
 * queue never saw the order at all.
 */
export const limitOrderTrackedStatuses = [
  ...limitSwapOrderStatuses,
  'rejected',
] as const

export type LimitOrderTrackedStatus = (typeof limitOrderTrackedStatuses)[number]

export type LimitSwapTransactionData = {
  /** The inbound tx's sender — the address the queue is polled by. */
  fromAddress: string
  fromToken: string
  fromTokenLogo: string
  fromTokenId?: string
  fromChain: Chain
  fromDecimals: number
  /** Sell amount in the source coin's smallest units. */
  fromAmount: string
  /** Buy-side ticker for display, decoded from the memo's asset notation. */
  buyTicker: string
  /** The buy asset in THORChain memo notation, as the placement memo spelt it. */
  targetAsset: string
  /** Guaranteed-minimum received, as a decimal string in buy-asset units. */
  minimumReceived: string
  destinationAddress: string
  expiryHours?: number
  /** The signed `=<` memo — the order itself; everything above derives from it. */
  memo: string
  orderStatus: LimitOrderTrackedStatus
  /**
   * Last-seen queue observation, in THORChain 1e8 fixed point. Deliberately
   * retained when the order goes terminal: the queue is the only source of the
   * fill split, and a TTL-expiry settle can follow a real partial fill —
   * dropping these on close would hide that the user received something.
   */
  deposit?: string
  amountIn?: string
  amountOut?: string
  /** Blocks until expiry at the last poll (~6s per THORChain block). */
  timeToExpiryBlocks?: number
  /**
   * The order's identity as it was SIGNED, captured at placement: assets in the
   * unabbreviated spelling a cancel memo requires, amounts in THORChain's 1e8.
   *
   * Separate from the display fields above because a cancel addresses an order
   * by `(assets, source amount, trade target)` and nothing else — no tx hash —
   * so these four have to be exact rather than presentable. `targetAsset` above
   * is the placement memo's spelling, which abbreviates an L1 contract and
   * therefore cannot address the order's bucket.
   *
   * Optional because orders placed before cancelling existed carry none. That
   * is what `missingSignedData` means, and why those orders can only be
   * cancelled once the queue has reported their identity back.
   */
  signedSourceAsset?: string
  signedTargetAsset?: string
  signedSourceAmount?: string
  signedTradeTarget?: string
  /**
   * The same identity as THORChain itself reports it, copied off the queue on
   * every poll. Authoritative by construction — this is the string THORChain
   * built the order's index entry from, after `fuzzyAssetMatch` expanded
   * whatever the placement memo abbreviated — and the only source for an order
   * that predates the signed fields.
   *
   * Kept alongside rather than overwriting them: a cancel is only safe when the
   * two AGREE, and a single merged field could not express the disagreement.
   */
  observedSourceAsset?: string
  observedTargetAsset?: string
  observedTradeTarget?: string
  /**
   * The cancel transaction broadcast against this order, once one has been.
   *
   * A cancel gets no history row of its own — it is a step in this order's
   * life, not a separate transfer — so this is the only place its hash
   * surfaces, and the only thing distinguishing "cancel sent" from "never
   * cancelled" while the order is still resting.
   */
  cancelTxHash?: string
}

export type LimitSwapTransactionRecord = TransactionRecordBase & {
  type: 'limitSwap'
  data: LimitSwapTransactionData
}

export type TransactionRecord =
  | SendTransactionRecord
  | SwapTransactionRecord
  | LimitSwapTransactionRecord

export type SerializedTransactionRecord = Omit<
  TransactionRecordBase,
  'data'
> & {
  data: string
}
