import {
  Address,
  beginCell,
  Cell,
  external,
  internal,
  loadStateInit,
  MessageRelaxed,
  OutActionSendMsg,
  storeMessage,
  storeMessageRelaxed,
  storeOutList,
} from '@ton/core'
import { Chain } from '@vultisig/core-chain/Chain'
import {
  getTonTxFailure,
  TonTxFailure,
  TonTxFailureReason,
} from '@vultisig/core-chain/chains/ton/failure'
import { tonPayloadToBase64 } from '@vultisig/core-chain/chains/ton/messageBody/decode'
import { getTonMessageBounceable } from '@vultisig/core-chain/chains/ton/messageBounce'
import { TonWalletVersion } from '@vultisig/core-chain/chains/ton/wallet'
import { tonV5R1WalletId } from '@vultisig/core-chain/chains/ton/walletV5R1'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { Coin } from '@vultisig/core-chain/coin/Coin'
import { getTonSendMode } from '@vultisig/core-mpc/keysign/signingInputs/resolvers/ton/native'
import { TonMessage } from '@vultisig/core-mpc/types/vultisig/keysign/v1/wasm_execute_contract_payload_pb'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'
import { attempt } from '@vultisig/lib-utils/attempt'
import { match } from '@vultisig/lib-utils/match'

type TonApiJettonPreview = {
  address: string
  decimals: number
  image?: string
  symbol: string
}

type TonApiJettonSwapAction = {
  amount_in: string
  amount_out: string
  jetton_master_in?: TonApiJettonPreview
  jetton_master_out?: TonApiJettonPreview
  ton_in?: number | string
  ton_out?: number | string
}

type TonApiAction = {
  JettonSwap?: TonApiJettonSwapAction
  status: 'ok' | 'failed'
  type: string
}

/**
 * The `Event` TonAPI returns from `/v2/events/emulate`: the actions it
 * recognized in the emulated trace, each with its own success verdict.
 */
export type TonApiEvent = {
  actions: TonApiAction[]
}

type TonApiTransaction = {
  aborted: boolean
  compute_phase?: {
    exit_code?: number
    skipped: boolean
  }
  action_phase?: {
    result_code: number
    skipped_actions: number
    success: boolean
  }
}

/**
 * The `Trace` TonAPI returns from `/v2/traces/emulate`: the sender's own
 * transaction and, recursively, every transaction its messages caused.
 */
export type TonApiTrace = {
  children?: TonApiTrace[]
  transaction: TonApiTransaction
}

/** A jetton swap TonAPI recognized in the emulation, as the amounts and coins on both sides. */
export type TonSimulationSwap = {
  fromAmount: bigint
  fromCoin: Coin
  toAmount: bigint
  toCoin: Coin
}

/**
 * The emulator's verdict that the transaction fails. `cause` is the failing
 * transaction's reason when the trace names one worth showing before signing;
 * `null` when only the verdict itself is known.
 */
export type TonSimulationFailure = {
  cause: TonTxFailure | null
}

/** What a TonAPI emulation of a TON Connect transaction found: a failure verdict and/or a recognized swap. */
export type TonSimulationInfo = {
  failure: TonSimulationFailure | null
  swap: TonSimulationSwap | null
}

type TonEmulationMessage = Pick<
  TonMessage,
  'amount' | 'payload' | 'stateInit' | 'to'
>

type BuildTonEmulationBocInput = {
  expireAt: bigint
  fromAddress: string
  sequenceNumber: bigint
  tonMessages: TonEmulationMessage[]
  walletVersion: TonWalletVersion
}

type BuildWalletBodyInput = {
  expireAt: bigint
  messages: MessageRelaxed[]
  sendMode: number
  sequenceNumber: bigint
}

const tonWalletV4R2WalletId = 698983191
// W5's `external_signed` opcode: the ASCII bytes of "sign".
const tonWalletV5R1ExternalSignedOp = 0x7369676e
const emptySignature = Buffer.alloc(64)

const getCellFromPayload = (payload?: string): Cell | undefined => {
  const normalized = tonPayloadToBase64(payload)
  if (!normalized) return undefined

  return attempt(() => Cell.fromBase64(normalized)).data
}

const toInternalMessage = ({
  amount,
  payload,
  stateInit,
  to,
}: TonEmulationMessage): MessageRelaxed => {
  const stateInitCell = getCellFromPayload(stateInit)

  return internal({
    to,
    value: BigInt(amount),
    // Derived the way the signer derives it: from each destination's own
    // address tag, never from a wallet-level default.
    bounce: getTonMessageBounceable(to, !!stateInit),
    init: stateInitCell ? loadStateInit(stateInitCell.beginParse()) : undefined,
    body: getCellFromPayload(payload),
  })
}

/**
 * V4R2 `recv_external`: signature || wallet_id || valid_until || seqno ||
 * op (0 = simple send) || (mode, ^message) per message.
 */
const buildV4R2Body = ({
  expireAt,
  messages,
  sendMode,
  sequenceNumber,
}: BuildWalletBodyInput): Cell => {
  const body = beginCell()
    .storeBuffer(emptySignature)
    .storeUint(tonWalletV4R2WalletId, 32)
    .storeUint(expireAt, 32)
    .storeUint(sequenceNumber, 32)
    .storeUint(0, 8)

  messages.forEach(message => {
    body
      .storeUint(sendMode, 8)
      .storeRef(beginCell().store(storeMessageRelaxed(message)).endCell())
  })

  return body.endCell()
}

/**
 * W5R1 `external_signed`: op || wallet_id || valid_until || seqno ||
 * ^OutList of send actions || no extended actions || signature.
 */
const buildV5R1Body = ({
  expireAt,
  messages,
  sendMode,
  sequenceNumber,
}: BuildWalletBodyInput): Cell => {
  const actions: OutActionSendMsg[] = messages.map(outMsg => ({
    type: 'sendMsg',
    mode: sendMode,
    outMsg,
  }))

  return beginCell()
    .storeUint(tonWalletV5R1ExternalSignedOp, 32)
    .storeUint(tonV5R1WalletId, 32)
    .storeUint(expireAt, 32)
    .storeUint(sequenceNumber, 32)
    .storeMaybeRef(beginCell().store(storeOutList(actions)).endCell())
    .storeBit(false)
    .storeBuffer(emptySignature)
    .endCell()
}

/**
 * The external message the emulator runs, as a base64 BOC: the same wallet
 * body the signer will produce, under the same send mode and per-message
 * bounce flags, carrying a zero signature the emulator is told to ignore.
 * Emulating anything else would preview a different transaction than the one
 * being signed.
 */
export const buildTonEmulationBoc = ({
  expireAt,
  fromAddress,
  sequenceNumber,
  tonMessages,
  walletVersion,
}: BuildTonEmulationBocInput): string => {
  const input: BuildWalletBodyInput = {
    expireAt,
    messages: tonMessages.map(toInternalMessage),
    sendMode: getTonSendMode(walletVersion),
    sequenceNumber,
  }

  const body = match(walletVersion, {
    v4r2: () => buildV4R2Body(input),
    v5r1: () => buildV5R1Body(input),
  })

  return beginCell()
    .store(storeMessage(external({ to: fromAddress, body })))
    .endCell()
    .toBoc()
    .toString('base64')
}

const getTonApiCoinFromJetton = (jetton: TonApiJettonPreview): Coin => ({
  chain: Chain.Ton,
  id:
    attempt(() => Address.parse(jetton.address).toString()).data ??
    jetton.address,
  ticker: jetton.symbol,
  decimals: jetton.decimals,
  logo: jetton.image,
})

const getTonAmount = (value?: number | string): bigint =>
  value === undefined ? 0n : BigInt(value)

/**
 * The jetton swap the emulator recognized, when its `JettonSwap` action
 * succeeds. A failed swap has no amounts worth quoting.
 */
export const getTonEmulationSwap = (
  event: TonApiEvent
): TonSimulationSwap | null => {
  const action = event.actions.find(
    action => action.status === 'ok' && action.type === 'JettonSwap'
  )?.JettonSwap

  if (!action) return null

  const tonIn = getTonAmount(action.ton_in)
  const tonOut = getTonAmount(action.ton_out)

  if (tonIn > 0n && action.jetton_master_out) {
    return {
      fromAmount: tonIn,
      fromCoin: chainFeeCoin[Chain.Ton],
      toAmount: BigInt(action.amount_out),
      toCoin: getTonApiCoinFromJetton(action.jetton_master_out),
    }
  }

  if (tonOut > 0n && action.jetton_master_in) {
    return {
      fromAmount: BigInt(action.amount_in),
      fromCoin: getTonApiCoinFromJetton(action.jetton_master_in),
      toAmount: tonOut,
      toCoin: chainFeeCoin[Chain.Ton],
    }
  }

  if (action.jetton_master_in && action.jetton_master_out) {
    return {
      fromAmount: BigInt(action.amount_in),
      fromCoin: getTonApiCoinFromJetton(action.jetton_master_in),
      toAmount: BigInt(action.amount_out),
      toCoin: getTonApiCoinFromJetton(action.jetton_master_out),
    }
  }

  return null
}

/**
 * TonAPI's verdict: at least one action of the emulated transaction fails,
 * whether the sender's wallet aborts or skips a transfer or a contract down
 * the line rejects it.
 */
export const hasFailedTonEmulationAction = (event: TonApiEvent): boolean =>
  event.actions.some(action => action.status === 'failed')

/**
 * Reasons whose explanation describes a transaction that already landed (the
 * fee was charged, check your history), which is the wrong advice before
 * signing. They are withheld in favor of the plain verdict.
 */
const postHocReasons: TonTxFailureReason[] = [
  'action-failed',
  'action-partially-failed',
]

const flattenTrace = (trace: TonApiTrace): TonApiTransaction[] => [
  trace.transaction,
  ...(trace.children ?? []).flatMap(flattenTrace),
]

/**
 * Why the emulated transaction fails, from the first failing transaction in
 * the trace (the sender's wallet first, then everything it triggered), as the
 * SDK classifies it. A recipient whose compute phase was skipped is not a
 * failure: an account with no code or no gas still receives the value. `null`
 * when nothing in the trace explains the verdict.
 */
export const getTonTraceFailureCause = (
  trace: TonApiTrace
): TonTxFailure | null => {
  for (const { aborted, action_phase, compute_phase } of flattenTrace(trace)) {
    if (compute_phase?.skipped) continue

    const failure = getTonTxFailure({
      aborted,
      compute_ph: compute_phase,
      action: action_phase,
    })

    if (failure && !isOneOf(failure.reason, postHocReasons)) return failure
  }

  return null
}
