import { create } from '@bufbuild/protobuf'
import { Chain } from '@vultisig/core-chain/Chain'
import { CoinSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/coin_pb'
import {
  KeysignPayload,
  KeysignPayloadSchema,
} from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { describe, expect, it } from 'vitest'

import {
  LimitSwapTransactionRecord,
  SendTransactionRecord,
  TransactionRecord,
} from '../core'
import { applyLimitOrderCancel } from './applyLimitOrderCancel'

const sender = 'thor1sender'
const cancelTxHash = 'CANCELHASH'
const fullUsdc = 'ETH.USDC-0XA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48'

const cancelMemo = `m=<:100000000THOR.RUNE:43079145${fullUsdc}:0`

const order = (
  overrides: Partial<LimitSwapTransactionRecord> = {},
  data: Partial<LimitSwapTransactionRecord['data']> = {}
): LimitSwapTransactionRecord => ({
  id: 'order-1',
  vaultId: 'vault',
  type: 'limitSwap',
  status: 'pending',
  chain: Chain.THORChain,
  timestamp: '2026-07-30T00:00:00.000Z',
  txHash: 'ORDERHASH',
  explorerUrl: '',
  fiatValue: '',
  ...overrides,
  data: {
    fromAddress: sender,
    fromToken: 'RUNE',
    fromTokenLogo: 'rune',
    fromChain: Chain.THORChain,
    fromDecimals: 8,
    fromAmount: '100000000',
    buyTicker: 'USDC',
    targetAsset: 'ETH.USDC-06EB48',
    minimumReceived: '0.43079145',
    destinationAddress: '0x14F6Ed6CBb27b607b0E2A48551A988F1a19c89B6',
    expiryHours: 24,
    memo: '=<:ETH.USDC-06EB48:0x14F6Ed6CBb27b607b0E2A48551A988F1a19c89B6:43079145/14400/0:v0:50',
    orderStatus: 'resting',
    observedTargetAsset: fullUsdc,
    ...data,
  },
})

const payload = (memo: string, address = sender): KeysignPayload =>
  create(KeysignPayloadSchema, {
    memo,
    toAmount: '0',
    coin: create(CoinSchema, {
      chain: Chain.THORChain,
      ticker: 'RUNE',
      address,
      decimals: 8,
      isNativeToken: true,
    }),
  })

describe('applyLimitOrderCancel', () => {
  it('attaches the cancel hash to the order its memo addresses', () => {
    const result = applyLimitOrderCancel({
      records: [order()],
      payload: payload(cancelMemo),
      txHash: cancelTxHash,
    })

    expect(result?.data.cancelTxHash).toBe(cancelTxHash)
  })

  // The order stays live until THORChain says otherwise: claiming a closure the
  // chain has not confirmed would strand a still-resting order in a terminal
  // state that nothing revisits.
  it('does not close the order, only marks the cancel as sent', () => {
    const result = applyLimitOrderCancel({
      records: [order()],
      payload: payload(cancelMemo),
      txHash: cancelTxHash,
    })

    expect(result?.data.orderStatus).toBe('resting')
    expect(result?.status).toBe('pending')
  })

  it.each([
    ['a placement', '=<:ETH.ETH:0xdest:100/14400/0'],
    ['a retarget', `m=<:100000000THOR.RUNE:43079145${fullUsdc}:50000000`],
    ['a plain send', ''],
  ])('ignores %s', (_, memo) => {
    expect(
      applyLimitOrderCancel({
        records: [order()],
        payload: payload(memo),
        txHash: cancelTxHash,
      })
    ).toBeNull()
  })

  it('ignores an order funded from a different address', () => {
    expect(
      applyLimitOrderCancel({
        records: [order()],
        payload: payload(cancelMemo, 'thor1someone-else'),
        txHash: cancelTxHash,
      })
    ).toBeNull()
  })

  it('ignores an order in a different bucket', () => {
    expect(
      applyLimitOrderCancel({
        records: [order({}, { fromAmount: '200000000' })],
        payload: payload(cancelMemo),
        txHash: cancelTxHash,
      })
    ).toBeNull()
  })

  // THORChain scans the bucket and closes the first match, which is the oldest
  // resting order. Marking any other one would tell the user the wrong order
  // closed.
  it('marks the oldest order when several share the bucket', () => {
    const older = order({
      id: 'older',
      timestamp: '2026-07-29T00:00:00.000Z',
    })
    const newer = order({ id: 'newer', timestamp: '2026-07-31T00:00:00.000Z' })

    const result = applyLimitOrderCancel({
      records: [newer, older],
      payload: payload(cancelMemo),
      txHash: cancelTxHash,
    })

    expect(result?.id).toBe('older')
  })

  // Without this, a second cancellation would re-mark an order that already has
  // one in flight, overwriting the hash of the transaction actually closing it.
  it('skips an order that already carries a cancellation', () => {
    const result = applyLimitOrderCancel({
      records: [
        order(
          { id: 'already', timestamp: '2026-07-29T00:00:00.000Z' },
          {
            cancelTxHash: 'FIRSTCANCEL',
          }
        ),
        order({ id: 'fresh' }),
      ],
      payload: payload(cancelMemo),
      txHash: cancelTxHash,
    })

    expect(result?.id).toBe('fresh')
  })

  it('ignores non-limit records entirely', () => {
    const send: SendTransactionRecord = {
      id: 'send-1',
      vaultId: 'vault',
      type: 'send',
      status: 'confirmed',
      chain: Chain.THORChain,
      timestamp: '2026-07-30T00:00:00.000Z',
      txHash: 'SENDHASH',
      explorerUrl: '',
      fiatValue: '',
      data: {
        fromAddress: sender,
        toAddress: 'thor1dest',
        amount: '1',
        token: 'RUNE',
        tokenLogo: '',
        decimals: 8,
      },
    }
    const records: TransactionRecord[] = [send]

    expect(
      applyLimitOrderCancel({
        records,
        payload: payload(cancelMemo),
        txHash: cancelTxHash,
      })
    ).toBeNull()
  })
})
