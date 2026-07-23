import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

import { getLimitOrderBlocker } from './placement'

const placeable = {
  fromChain: Chain.Bitcoin,
  toChain: Chain.Ethereum,
  isSameAsset: false,
  amount: 100_000_000n,
  balance: 200_000_000n,
  price: 16,
  isQueueEnabled: true,
  supportedChains: [Chain.Bitcoin, Chain.Ethereum, Chain.THORChain],
  marketPrice: 15,
  memoError: undefined,
}

describe('getLimitOrderBlocker', () => {
  it('allows a fully valid order', () => {
    expect(getLimitOrderBlocker(placeable)).toBeUndefined()
  })

  describe('fails closed on the live gates', () => {
    // Both services resolve their own failures to "unavailable" rather than
    // throwing, so a pending/false value must block rather than optimistically
    // allow.
    it.each([false, undefined])(
      'blocks while the advanced swap queue reads %s',
      isQueueEnabled => {
        expect(getLimitOrderBlocker({ ...placeable, isQueueEnabled })).toBe(
          'queueUnavailable'
        )
      }
    )

    it('blocks while supported chains are unknown', () => {
      expect(
        getLimitOrderBlocker({ ...placeable, supportedChains: undefined })
      ).toBe('chainUnavailable')
    })

    it('blocks a chain with no live inbound', () => {
      expect(
        getLimitOrderBlocker({
          ...placeable,
          supportedChains: [Chain.Ethereum, Chain.THORChain],
        })
      ).toBe('chainUnavailable')
    })
  })

  it('blocks a pair THORChain cannot route', () => {
    expect(getLimitOrderBlocker({ ...placeable, toChain: Chain.Sui })).toBe(
      'pairNotRoutable'
    )
  })

  it('blocks swapping an asset for itself', () => {
    expect(getLimitOrderBlocker({ ...placeable, isSameAsset: true })).toBe(
      'sameAsset'
    )
  })

  it.each([null, 0n])('blocks a %s amount', amount => {
    expect(getLimitOrderBlocker({ ...placeable, amount })).toBe('noAmount')
  })

  it('blocks an amount above balance', () => {
    expect(getLimitOrderBlocker({ ...placeable, amount: 300_000_000n })).toBe(
      'insufficientBalance'
    )
  })

  it('allows an amount equal to balance', () => {
    expect(
      getLimitOrderBlocker({ ...placeable, amount: 200_000_000n })
    ).toBeUndefined()
  })

  it.each([null, 0])('blocks a %s price', price => {
    expect(getLimitOrderBlocker({ ...placeable, price })).toBe('noPrice')
  })

  // A successful probe doubles as proof the pair has a pool; without one the
  // presets have nothing to anchor to.
  it('blocks when the market probe returned nothing', () => {
    expect(getLimitOrderBlocker({ ...placeable, marketPrice: undefined })).toBe(
      'noMarketPrice'
    )
  })

  it('blocks when the memo could not be built', () => {
    expect(
      getLimitOrderBlocker({ ...placeable, memoError: 'exceeds utxo limit 80' })
    ).toBe('memoInvalid')
  })

  it('reports the most fundamental problem first', () => {
    expect(
      getLimitOrderBlocker({
        ...placeable,
        isQueueEnabled: false,
        toChain: Chain.Sui,
        amount: null,
        price: null,
      })
    ).toBe('queueUnavailable')
  })
})
