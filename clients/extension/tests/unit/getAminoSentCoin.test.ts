import { describe, expect, it } from 'vitest'

import { getAminoSentCoin } from '@clients/extension/src/inpage/providers/cosmos/getAminoSentCoin'

const sender = 'osmo1sender'

describe('getAminoSentCoin', () => {
  it('reads token_in from an Osmosis swap-exact-amount-in', () => {
    expect(
      getAminoSentCoin({
        sender,
        routes: [{ pool_id: '1', token_out_denom: 'uion' }],
        token_in: { denom: 'uosmo', amount: '1000000' },
        token_out_min_amount: '1',
      })
    ).toEqual({ denom: 'uosmo', amount: '1000000' })
  })

  it('sums route amounts of an Osmosis split-amount-in', () => {
    expect(
      getAminoSentCoin({
        sender,
        routes: [
          {
            pools: [{ pool_id: '1', token_out_denom: 'uion' }],
            token_in_amount: '700000',
          },
          {
            pools: [{ pool_id: '2', token_out_denom: 'uion' }],
            token_in_amount: '300000',
          },
        ],
        token_in_denom: 'uosmo',
        token_out_min_amount: '1',
      })
    ).toEqual({ denom: 'uosmo', amount: '1000000' })
  })

  it('sums split route amounts beyond Number precision', () => {
    expect(
      getAminoSentCoin({
        sender,
        routes: [
          { pools: [], token_in_amount: '9007199254740993' },
          { pools: [], token_in_amount: '1' },
        ],
        token_in_denom: 'uosmo',
        token_out_min_amount: '1',
      })
    ).toEqual({ denom: 'uosmo', amount: '9007199254740994' })
  })

  it.each([
    ['a missing', [{ pools: [] }]],
    ['a decimal', [{ pools: [], token_in_amount: '1.5' }]],
    ['a non-numeric', [{ pools: [], token_in_amount: 'abc' }]],
    ['a numeric', [{ pools: [], token_in_amount: 5 }]],
  ])(
    'does not throw on a split route with %s token_in_amount',
    (_, routes) => {
      expect(
        getAminoSentCoin({
          sender,
          routes,
          token_in_denom: 'uosmo',
          token_out_min_amount: '1',
        })
      ).toBeUndefined()
    }
  )

  it('does not treat empty split routes as a zero-amount coin', () => {
    expect(
      getAminoSentCoin({
        sender,
        routes: [],
        token_in_denom: 'uosmo',
        token_out_min_amount: '1',
      })
    ).toBeUndefined()
  })

  it('falls back to funds[0] when split routes are malformed', () => {
    expect(
      getAminoSentCoin({
        sender,
        routes: [{ pools: [] }],
        token_in_denom: 'uosmo',
        funds: [{ denom: 'uosmo', amount: '9' }],
      })
    ).toEqual({ denom: 'uosmo', amount: '9' })
  })

  it('reads token from an IBC transfer', () => {
    expect(
      getAminoSentCoin({
        sender,
        receiver: 'cosmos1receiver',
        token: { denom: 'uosmo', amount: '5' },
      })
    ).toEqual({ denom: 'uosmo', amount: '5' })
  })

  it('reads amount[0] from a bank send', () => {
    expect(
      getAminoSentCoin({
        from_address: sender,
        to_address: 'osmo1receiver',
        amount: [{ denom: 'uosmo', amount: '7' }],
      })
    ).toEqual({ denom: 'uosmo', amount: '7' })
  })

  it('reads funds[0] from a wasm execute', () => {
    expect(
      getAminoSentCoin({
        sender,
        contract: 'osmo1contract',
        msg: {},
        funds: [{ denom: 'uosmo', amount: '9' }],
      })
    ).toEqual({ denom: 'uosmo', amount: '9' })
  })

  it('returns undefined when the message moves no coin', () => {
    expect(
      getAminoSentCoin({ sender, contract: 'osmo1contract', msg: {} })
    ).toBeUndefined()
  })
})
