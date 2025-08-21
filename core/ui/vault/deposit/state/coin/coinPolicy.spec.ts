import { Chain } from '@core/chain/Chain'
import { describe, expect, it } from 'vitest'

import { coerceSelectedCoin } from './coinPolicy'

const coin = (ticker: string, chain: Chain) =>
  ({ ticker, chain, decimals: 6 }) as any

describe('coerceSelectedCoin', () => {
  const coins = [
    coin('RUNE', Chain.THORChain),
    coin('RUJI', Chain.THORChain),
    coin('TCY', Chain.THORChain),
  ]

  it('forces RUJI for ruji actions', () => {
    expect(
      coerceSelectedCoin({
        chain: Chain.THORChain,
        action: 'stake_ruji',
        selected: coin('RUNE', Chain.THORChain),
        coins,
      })?.ticker
    ).toBe('RUJI')
    expect(
      coerceSelectedCoin({
        chain: Chain.THORChain,
        action: 'unstake_ruji',
        selected: coin('RUNE', Chain.THORChain),
        coins,
      })?.ticker
    ).toBe('RUJI')
  })

  it('forces RUNE for bond', () => {
    expect(
      coerceSelectedCoin({
        chain: Chain.THORChain,
        action: 'bond',
        selected: coin('RUNE', Chain.THORChain),
        coins,
      })?.ticker
    ).toBe('RUNE')
  })

  it('TCY only for THORChain stake/unstake', () => {
    expect(
      coerceSelectedCoin({
        chain: Chain.THORChain,
        action: 'stake',
        selected: coin('RUNE', Chain.THORChain),
        coins,
      })?.ticker
    ).toBe('TCY')
    expect(
      coerceSelectedCoin({
        chain: Chain.THORChain,
        action: 'unstake',
        selected: coin('TCY', Chain.THORChain),
        coins,
      })?.ticker
    ).toBe('TCY')
  })

  it('Ton stake returns null selection (no selector UI)', () => {
    expect(
      coerceSelectedCoin({
        chain: Chain.Ton,
        action: 'stake',
        selected: coin('TON', Chain.Ton),
        coins,
      })
    ).toBeNull()
  })

  it('drops RUNE for merge-like actions', () => {
    expect(
      coerceSelectedCoin({
        chain: Chain.THORChain,
        action: 'merge',
        selected: coin('RUNE', Chain.THORChain),
        coins,
      })
    ).toBeNull()
    expect(
      coerceSelectedCoin({
        chain: Chain.THORChain,
        action: 'redeem',
        selected: coin('RUNE', Chain.THORChain),
        coins,
      })
    ).toBeNull()
  })
})
