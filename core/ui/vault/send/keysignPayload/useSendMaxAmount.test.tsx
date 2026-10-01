// @vitest-environment happy-dom
/**
 * Verify decides the UTXO max-spend flag from the committed send state, so a
 * send that skips the form (agent or staking navigation with `skipToVerify`)
 * is flagged the same way as one submitted from it. The form is never rendered
 * here: only the state Verify reads is mocked.
 */
import { renderHook } from '@testing-library/react'
import { Chain } from '@vultisig/core-chain/Chain'
import type { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { beforeEach, describe, expect, it, vi } from 'vitest'

type QueryState = {
  data: bigint | undefined
  error: Error | null
  isPlaceholderData: boolean
}

type SendState = {
  coin: AccountCoin | undefined
  amount: bigint | null
  balance: QueryState
  fee: QueryState
}

const send = vi.hoisted(() => {
  const state: SendState = {
    coin: undefined,
    amount: null,
    balance: { data: undefined, error: null, isPlaceholderData: false },
    fee: { data: undefined, error: null, isPlaceholderData: false },
  }
  return state
})

vi.mock('../state/sendCoin', () => ({ useCurrentSendCoin: () => send.coin }))
vi.mock('../state/amount', () => ({
  useSendAmount: () => [send.amount, () => {}],
}))
vi.mock('../queries/useSendBalanceQuery', () => ({
  useSendBalanceQuery: () => send.balance,
}))
vi.mock('../queries/useSendFeeEstimateQuery', () => ({
  useSendFeeEstimateQuery: () => send.fee,
}))

import { useSendMaxAmount } from './useSendMaxAmount'

const address = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'

const loaded = (data: bigint): QueryState => ({
  data,
  error: null,
  isPlaceholderData: false,
})

const getSendMaxAmount = () =>
  renderHook(() => useSendMaxAmount()).result.current

describe('useSendMaxAmount', () => {
  beforeEach(() => {
    send.coin = { ...chainFeeCoin[Chain.Bitcoin], address }
    send.amount = 999_450n
    send.balance = loaded(1_000_000n)
    send.fee = loaded(550n)
  })

  it('flags a UTXO send of the balance less the current fee without a form submit', () => {
    expect(getSendMaxAmount()).toBe(true)
  })

  it('signs a smaller amount as given', () => {
    send.amount = 999_449n

    expect(getSendMaxAmount()).toBe(false)
  })

  it('waits while the fee for the current receiver is loading', () => {
    send.fee = { data: undefined, error: null, isPlaceholderData: false }

    expect(getSendMaxAmount()).toBeNull()
  })

  it('waits instead of judging by the previous estimate shown while a new one loads', () => {
    send.fee = { data: 550n, error: null, isPlaceholderData: true }

    expect(getSendMaxAmount()).toBeNull()
  })

  it('signs the amount as given when the fee cannot be estimated', () => {
    send.fee = {
      data: undefined,
      error: new Error('fee unavailable'),
      isPlaceholderData: false,
    }

    expect(getSendMaxAmount()).toBe(false)
  })

  it('never waits for a fee on a chain that is not UTXO', () => {
    send.coin = { ...chainFeeCoin[Chain.Ethereum], address }
    send.fee = { data: undefined, error: null, isPlaceholderData: false }

    expect(getSendMaxAmount()).toBe(false)
  })
})
