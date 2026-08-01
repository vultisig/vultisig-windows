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
  destinationAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
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

  // Consistent with the other live gates: affordability is unknown while the
  // balance query loads, so placement stays blocked.
  it('blocks while the balance is still loading', () => {
    expect(getLimitOrderBlocker({ ...placeable, balance: undefined })).toBe(
      'insufficientBalance'
    )
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

  it.each([undefined, '', '   '])(
    'blocks a missing destination address (%j)',
    destinationAddress => {
      expect(getLimitOrderBlocker({ ...placeable, destinationAddress })).toBe(
        'noDestination'
      )
    }
  )

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

// The CTA is enabled exactly when there is no blocker, and `placeOrder` then
// guards again on the fields the hand-off needs. These assert the two agree: an
// enabled button must never hit that guard and silently do nothing.
describe('confirm gating contract', () => {
  it('implies a positive amount when placeable', () => {
    expect(getLimitOrderBlocker(placeable)).toBeUndefined()
    expect(placeable.amount).not.toBeNull()
    expect(placeable.amount > 0n).toBe(true)
  })

  it('implies the memo built, so the hand-off has one to sign', () => {
    expect(getLimitOrderBlocker(placeable)).toBeUndefined()
    expect(placeable.memoError).toBeUndefined()
  })

  it('implies a usable price and market anchor for the receive amount', () => {
    expect(getLimitOrderBlocker(placeable)).toBeUndefined()
    expect(placeable.price).not.toBeNull()
    expect(placeable.marketPrice).toBeTruthy()
  })

  // Each blocker must disable the CTA — none may resolve to "placeable".
  it.each([
    ['queueUnavailable', { isQueueEnabled: false }],
    ['pairNotRoutable', { toChain: Chain.Sui }],
    ['chainUnavailable', { supportedChains: undefined }],
    ['sameAsset', { isSameAsset: true }],
    ['noAmount', { amount: null }],
    ['insufficientBalance', { balance: undefined }],
    ['noPrice', { price: null }],
    ['noMarketPrice', { marketPrice: undefined }],
    ['noDestination', { destinationAddress: undefined }],
    ['memoInvalid', { memoError: 'exceeds utxo limit 80' }],
  ] as const)('keeps the CTA disabled for %s', (_, override) => {
    expect(getLimitOrderBlocker({ ...placeable, ...override })).toBeDefined()
  })
})
