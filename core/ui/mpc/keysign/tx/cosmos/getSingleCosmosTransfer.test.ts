import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

import { CosmosSignDataReview } from './getCosmosSignDataReview'
import { getSingleCosmosTransfer } from './getSingleCosmosTransfer'

const review = (
  overrides: Partial<CosmosSignDataReview>
): CosmosSignDataReview => ({
  chain: Chain.Cosmos,
  transfers: [
    { recipient: 'cosmos1first', coin: { denom: 'uatom', amount: 5n } },
  ],
  memo: '',
  hasUnsummarizedMessages: false,
  ...overrides,
})

const atom = { chain: Chain.Cosmos }

describe('getSingleCosmosTransfer', () => {
  it('returns the only transfer in the given coin', () => {
    expect(getSingleCosmosTransfer({ review: review({}), coin: atom })).toEqual(
      { recipient: 'cosmos1first', amount: 5n }
    )
  })

  it('returns nothing for several transfers', () => {
    const transfers = [
      { recipient: 'cosmos1first', coin: { denom: 'uatom', amount: 1n } },
      { recipient: 'cosmos1second', coin: { denom: 'uatom', amount: 2n } },
    ]

    expect(
      getSingleCosmosTransfer({ review: review({ transfers }), coin: atom })
    ).toBeUndefined()
  })

  it('returns nothing when part of the data is not summarized', () => {
    expect(
      getSingleCosmosTransfer({
        review: review({ hasUnsummarizedMessages: true }),
        coin: atom,
      })
    ).toBeUndefined()
  })

  it('returns nothing for another coin or a transfer without a recipient', () => {
    expect(
      getSingleCosmosTransfer({
        review: review({}),
        coin: { chain: Chain.Cosmos, id: 'ibc/ABC' },
      })
    ).toBeUndefined()

    expect(
      getSingleCosmosTransfer({
        review: review({
          transfers: [{ coin: { denom: 'uatom', amount: 5n } }],
        }),
        coin: atom,
      })
    ).toBeUndefined()
  })
})
