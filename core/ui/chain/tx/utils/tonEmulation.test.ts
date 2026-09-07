import {
  Address,
  beginCell,
  Cell,
  loadMessage,
  loadMessageRelaxed,
  loadOutList,
  SendMode,
  storeStateInit,
} from '@ton/core'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { describe, expect, it } from 'vitest'

import {
  buildTonEmulationBoc,
  getTonEmulationSwap,
  getTonTraceFailureCause,
  hasFailedTonEmulationAction,
  TonApiEvent,
  TonApiTrace,
} from './tonEmulation'

const sender = Address.parse(
  '0:23fa979918f1fe702db9100bf843e87c7015eccd39a4721e9b6bac170bc04ce3'
)
const fromAddress = sender.toString({ bounceable: false })
const bounceableTo = 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs'
const nonBounceableTo = Address.parse(bounceableTo).toString({
  bounceable: false,
})

const payloadCell = beginCell()
  .storeUint(0, 32)
  .storeStringTail('hello')
  .endCell()
const payload = payloadCell.toBoc().toString('base64')

const stateInit = beginCell()
  .store(
    storeStateInit({
      code: beginCell().storeUint(1, 8).endCell(),
      data: beginCell().storeUint(2, 8).endCell(),
    })
  )
  .endCell()
  .toBoc()
  .toString('base64')

const tonMessages = [
  { to: bounceableTo, amount: '1000', payload },
  { to: nonBounceableTo, amount: '2000' },
]

const expireAt = 1_800_000_000n
const sequenceNumber = 131n

const loadExternalBody = (boc: string) => {
  const message = loadMessage(Cell.fromBase64(boc).beginParse())

  expect(message.info.type).toBe('external-in')
  expect(
    message.info.type === 'external-in' && message.info.dest.equals(sender)
  ).toBe(true)

  return message.body.beginParse()
}

const loadInternal = (cell: Cell) => {
  const message = loadMessageRelaxed(cell.beginParse())
  if (message.info.type !== 'internal') {
    throw new Error(`expected an internal message, got ${message.info.type}`)
  }

  return { ...message, info: message.info }
}

describe('buildTonEmulationBoc', () => {
  it('builds the V4R2 body the wallet parses: signature, ids, op byte, then a mode and ref per message', () => {
    const body = loadExternalBody(
      buildTonEmulationBoc({
        expireAt,
        fromAddress,
        sequenceNumber,
        tonMessages,
        walletVersion: 'v4r2',
      })
    )

    expect(body.loadBuffer(64).equals(Buffer.alloc(64))).toBe(true)
    expect(body.loadUint(32)).toBe(698983191)
    expect(body.loadUint(32)).toBe(Number(expireAt))
    expect(body.loadUint(32)).toBe(Number(sequenceNumber))
    expect(body.loadUint(8)).toBe(0)

    expect(body.loadUint(8)).toBe(SendMode.PAY_GAS_SEPARATELY)
    const first = loadInternal(body.loadRef())
    expect(first.info.dest.equals(Address.parse(bounceableTo))).toBe(true)
    expect(first.info.bounce).toBe(true)
    expect(first.info.value.coins).toBe(1000n)
    expect(first.body.equals(payloadCell)).toBe(true)

    expect(body.loadUint(8)).toBe(SendMode.PAY_GAS_SEPARATELY)
    const second = loadInternal(body.loadRef())
    expect(second.info.dest.equals(Address.parse(nonBounceableTo))).toBe(true)
    expect(second.info.bounce).toBe(false)
    expect(second.info.value.coins).toBe(2000n)
    expect(second.body.bits.length).toBe(0)

    expect(body.remainingBits).toBe(0)
    expect(body.remainingRefs).toBe(0)
  })

  it('builds the W5 body: external_signed op, W5 wallet id, send actions with IGNORE_ERRORS, no extended actions, signature last', () => {
    const body = loadExternalBody(
      buildTonEmulationBoc({
        expireAt,
        fromAddress,
        sequenceNumber,
        tonMessages,
        walletVersion: 'v5r1',
      })
    )

    expect(body.loadUint(32)).toBe(0x7369676e)
    expect(body.loadUint(32)).toBe(2147483409)
    expect(body.loadUint(32)).toBe(Number(expireAt))
    expect(body.loadUint(32)).toBe(Number(sequenceNumber))

    const actions = loadOutList(
      shouldBePresent(body.loadMaybeRef()).beginParse()
    )
    expect(actions).toHaveLength(2)
    actions.forEach(action => {
      expect(action.type).toBe('sendMsg')
      if (action.type !== 'sendMsg') return
      expect(action.mode).toBe(
        SendMode.PAY_GAS_SEPARATELY | SendMode.IGNORE_ERRORS
      )
    })
    const [first, second] = actions
    expect(
      first.type === 'sendMsg' &&
        first.outMsg.info.type === 'internal' &&
        first.outMsg.info.dest.equals(Address.parse(bounceableTo)) &&
        first.outMsg.info.bounce
    ).toBe(true)
    expect(
      second.type === 'sendMsg' &&
        second.outMsg.info.type === 'internal' &&
        second.outMsg.info.bounce
    ).toBe(false)

    expect(body.loadBit()).toBe(false)
    expect(body.loadBuffer(64).equals(Buffer.alloc(64))).toBe(true)
    expect(body.remainingBits).toBe(0)
    expect(body.remainingRefs).toBe(0)
  })

  it('attaches a message stateInit and sends a raw-address deployment non-bounceable', () => {
    const body = loadExternalBody(
      buildTonEmulationBoc({
        expireAt,
        fromAddress,
        sequenceNumber,
        tonMessages: [
          {
            to: Address.parse(bounceableTo).toRawString(),
            amount: '1',
            stateInit,
          },
        ],
        walletVersion: 'v4r2',
      })
    )
    body.skip(64 * 8 + 32 * 3 + 8 + 8)

    const message = loadInternal(body.loadRef())
    expect(message.init?.code?.bits.length).toBe(8)
    expect(message.init?.data?.bits.length).toBe(8)
    expect(message.info.bounce).toBe(false)
  })
})

const okSwap: TonApiEvent = {
  actions: [
    {
      type: 'JettonSwap',
      status: 'ok',
      JettonSwap: {
        amount_in: '0',
        amount_out: '2500000',
        ton_in: 1000000000,
        jetton_master_out: {
          address:
            '0:b113a994b5024a16719f69139328eb759596c38a25f59028b146fecdc3621dfe',
          decimals: 6,
          symbol: 'JET',
        },
      },
    },
  ],
}

describe('getTonEmulationSwap', () => {
  it('quotes a successful jetton swap', () => {
    const swap = getTonEmulationSwap(okSwap)

    expect(swap?.fromAmount).toBe(1000000000n)
    expect(swap?.fromCoin.ticker).toBe('GRAM')
    expect(swap?.toAmount).toBe(2500000n)
    expect(swap?.toCoin.ticker).toBe('JET')
    expect(swap?.toCoin.id).toBe(bounceableTo)
  })

  it('does not quote a swap the emulator says fails', () => {
    const [action] = okSwap.actions
    expect(
      getTonEmulationSwap({ actions: [{ ...action, status: 'failed' }] })
    ).toBeNull()
  })
})

describe('hasFailedTonEmulationAction', () => {
  it('is the verdict of any failed action, even next to successful ones', () => {
    expect(hasFailedTonEmulationAction(okSwap)).toBe(false)
    expect(
      hasFailedTonEmulationAction({
        actions: [
          { type: 'JettonTransfer', status: 'failed' },
          { type: 'TonTransfer', status: 'ok' },
        ],
      })
    ).toBe(true)
    expect(hasFailedTonEmulationAction({ actions: [] })).toBe(false)
  })
})

const okTransaction = {
  aborted: false,
  compute_phase: { skipped: false, exit_code: 0 },
  action_phase: { success: true, result_code: 0, skipped_actions: 0 },
}

const skippedRecipient: TonApiTrace = {
  transaction: { aborted: true, compute_phase: { skipped: true } },
}

describe('getTonTraceFailureCause', () => {
  it('explains a wallet that aborts for lack of funds', () => {
    const cause = getTonTraceFailureCause({
      transaction: {
        aborted: true,
        compute_phase: { skipped: false, exit_code: 0 },
        action_phase: { success: false, result_code: 37, skipped_actions: 0 },
      },
    })

    expect(cause?.reason).toBe('insufficient-funds')
    expect(cause?.exitCode).toBe(37)
  })

  it('leaves a skipped action unexplained rather than describing a landed transaction', () => {
    expect(
      getTonTraceFailureCause({
        transaction: {
          ...okTransaction,
          action_phase: { success: true, result_code: 0, skipped_actions: 1 },
        },
      })
    ).toBeNull()
  })

  it('explains a contract down the line rejecting the transfer', () => {
    const cause = getTonTraceFailureCause({
      transaction: okTransaction,
      children: [
        {
          transaction: {
            aborted: true,
            compute_phase: { skipped: false, exit_code: 47 },
          },
          children: [{ transaction: okTransaction }],
        },
      ],
    })

    expect(cause?.reason).toBe('contract-rejected')
    expect(cause?.exitCode).toBe(47)
  })

  it('does not read a recipient with a skipped compute phase as a failure', () => {
    expect(
      getTonTraceFailureCause({
        transaction: okTransaction,
        children: [skippedRecipient],
      })
    ).toBeNull()
  })
})
