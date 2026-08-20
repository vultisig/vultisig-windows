import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

import {
  getLimitBlockerNotice,
  getLimitOrderBlocker,
  getLimitPairBlocker,
} from './placement'

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

  // The asset step is reached before an amount or a price exists, so a
  // pair-level problem has to outrank both — otherwise an unroutable pair reads
  // as "enter an amount" and the user only learns the truth a step later.
  it.each([
    ['pairNotRoutable', { toChain: Chain.Sui }],
    ['chainUnavailable', { supportedChains: undefined }],
    ['sameAsset', { isSameAsset: true }],
    ['noDestination', { destinationAddress: undefined }],
    ['noMarketPrice', { marketPrice: undefined }],
  ] as const)(
    'reports %s ahead of the missing inputs',
    (expected, override) => {
      expect(
        getLimitOrderBlocker({
          ...placeable,
          ...override,
          amount: null,
          balance: undefined,
          price: null,
        })
      ).toBe(expected)
    }
  )
})

// What the asset step gates on: everything the pair alone decides, with no
// amount or price in the picture.
describe('getLimitPairBlocker', () => {
  const pair = {
    fromChain: placeable.fromChain,
    toChain: placeable.toChain,
    isSameAsset: placeable.isSameAsset,
    isQueueEnabled: placeable.isQueueEnabled,
    supportedChains: placeable.supportedChains,
    marketPrice: placeable.marketPrice,
    destinationAddress: placeable.destinationAddress,
  }

  it('clears a routable pair before any amount or price is entered', () => {
    expect(getLimitPairBlocker(pair)).toBeUndefined()
  })

  it.each([
    ['queueUnavailable', { isQueueEnabled: false }],
    ['pairNotRoutable', { toChain: Chain.Sui }],
    ['chainUnavailable', { supportedChains: undefined }],
    ['sameAsset', { isSameAsset: true }],
    ['noDestination', { destinationAddress: '   ' }],
    ['noMarketPrice', { marketPrice: undefined }],
  ] as const)('blocks the pair with %s', (expected, override) => {
    expect(getLimitPairBlocker({ ...pair, ...override })).toBe(expected)
  })

  // The two must agree by construction: the CTA gate delegates here, so a pair
  // the asset step calls tradeable can never be one the CTA rejects for a
  // pair-level reason (or vice versa).
  it('is what the full gate reports for a pair-level problem', () => {
    const input = { ...placeable, toChain: Chain.Sui }

    expect(getLimitOrderBlocker(input)).toBe(getLimitPairBlocker(input))
  })
})

// The gates fail closed, so every one of them reads as "blocked" while it
// loads. That is right for the button and wrong for the message.
describe('getLimitBlockerNotice', () => {
  const resolved = {
    isQueueEnabled: true,
    supportedChains: placeable.supportedChains,
    balance: placeable.balance,
    isMarketPriceLoading: false,
  }

  it('says nothing when nothing is blocked', () => {
    expect(
      getLimitBlockerNotice({ ...resolved, blocker: undefined })
    ).toBeUndefined()
  })

  it.each([
    ['queueUnavailable', { isQueueEnabled: undefined }],
    ['chainUnavailable', { supportedChains: undefined }],
    ['insufficientBalance', { balance: undefined }],
    ['noMarketPrice', { isMarketPriceLoading: true }],
  ] as const)(
    'withholds %s while its gate is unresolved',
    (blocker, pending) => {
      expect(
        getLimitBlockerNotice({ ...resolved, ...pending, blocker })
      ).toBeUndefined()
    }
  )

  it.each([
    ['queueUnavailable', { isQueueEnabled: false }],
    ['chainUnavailable', {}],
    ['insufficientBalance', {}],
    ['noMarketPrice', {}],
  ] as const)('announces %s once its gate has answered', (blocker, settled) => {
    expect(getLimitBlockerNotice({ ...resolved, ...settled, blocker })).toBe(
      blocker
    )
  })

  // No live gate stands behind these, so they are verdicts the instant they
  // appear.
  it.each([
    'pairNotRoutable',
    'sameAsset',
    'noDestination',
    'noAmount',
    'noPrice',
    'memoInvalid',
  ] as const)('announces %s immediately', blocker => {
    expect(
      getLimitBlockerNotice({
        ...resolved,
        isQueueEnabled: undefined,
        supportedChains: undefined,
        balance: undefined,
        isMarketPriceLoading: true,
        blocker,
      })
    ).toBe(blocker)
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
