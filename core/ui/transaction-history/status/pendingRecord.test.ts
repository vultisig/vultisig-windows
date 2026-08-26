import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

import { TransactionRecord, TransactionRecordStatus } from '../core'
import { isChainPollable, isSettlingTransition } from './pendingRecord'

const base = {
  id: 'record-1',
  vaultId: 'vault-1',
  timestamp: new Date().toISOString(),
  txHash: '0xhash',
  explorerUrl: 'https://example.com',
  fiatValue: '0',
}

const sendWith = (status: TransactionRecordStatus): TransactionRecord => ({
  ...base,
  status,
  type: 'send',
  chain: Chain.Ethereum,
  data: {
    fromAddress: '0x1111111111111111111111111111111111111111',
    toAddress: '0x2222222222222222222222222222222222222222',
    amount: '1',
    token: 'USDC',
    tokenLogo: 'usdc',
    tokenId: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    decimals: 6,
  },
})

const limitSwapWith = (status: TransactionRecordStatus): TransactionRecord => ({
  ...base,
  status,
  type: 'limitSwap',
  chain: Chain.THORChain,
  data: {
    fromAddress: 'thor1wallet',
    fromToken: 'RUNE',
    fromTokenLogo: 'rune',
    fromChain: Chain.THORChain,
    fromDecimals: 8,
    fromAmount: '100000000',
    buyTicker: 'USDC',
    targetAsset: 'ETH.USDC',
    minimumReceived: '10',
    destinationAddress: '0x2222222222222222222222222222222222222222',
    memo: '=:ETH.USDC:0x2222222222222222222222222222222222222222',
    orderStatus: 'resting',
  },
})

describe('isChainPollable', () => {
  it('polls a broadcasted send', () => {
    expect(isChainPollable(sendWith('broadcasted'))).toBe(true)
  })

  it('polls a pending send', () => {
    expect(isChainPollable(sendWith('pending'))).toBe(true)
  })

  it('stops polling once a send is confirmed', () => {
    expect(isChainPollable(sendWith('confirmed'))).toBe(false)
  })

  it('stops polling a failed send', () => {
    expect(isChainPollable(sendWith('failed'))).toBe(false)
  })

  // Their inbound deposit confirms in seconds while the order rests for hours,
  // so chain status would contradict the order's own state.
  it('leaves limit orders to their own tracker even while pending', () => {
    expect(isChainPollable(limitSwapWith('pending'))).toBe(false)
    expect(isChainPollable(limitSwapWith('broadcasted'))).toBe(false)
  })
})

describe('isSettlingTransition', () => {
  type TransitionInput = {
    from: TransactionRecordStatus
    to: TransactionRecordStatus
  }

  const transition = ({ from, to }: TransitionInput) =>
    isSettlingTransition({ previous: sendWith(from), update: sendWith(to) })

  it('settles on confirmation', () => {
    expect(transition({ from: 'pending', to: 'confirmed' })).toBe(true)
  })

  // A reverted transaction still burned its fee, so the balance it drew the
  // fee from is as stale as after a confirmation.
  it('settles on failure', () => {
    expect(transition({ from: 'pending', to: 'failed' })).toBe(true)
  })

  it('settles again when a failed send heals to confirmed', () => {
    expect(transition({ from: 'failed', to: 'confirmed' })).toBe(true)
  })

  it('does not settle while still in flight', () => {
    expect(transition({ from: 'broadcasted', to: 'pending' })).toBe(false)
  })

  it('does not settle twice on a re-poll of the same verdict', () => {
    expect(transition({ from: 'confirmed', to: 'confirmed' })).toBe(false)
    expect(transition({ from: 'failed', to: 'failed' })).toBe(false)
  })
})
