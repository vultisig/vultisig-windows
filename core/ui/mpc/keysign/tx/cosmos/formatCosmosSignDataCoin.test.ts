import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

import { formatCosmosSignDataCoin } from './formatCosmosSignDataCoin'

describe('formatCosmosSignDataCoin', () => {
  it('formats the fee coin with its ticker and decimals', () => {
    expect(
      formatCosmosSignDataCoin({
        chain: Chain.Cosmos,
        coin: { denom: 'uatom', amount: 1000000000n },
      })
    ).toBe('1000.0 ATOM')
  })

  it('formats a known token by its denom', () => {
    expect(
      formatCosmosSignDataCoin({
        chain: Chain.THORChain,
        coin: { denom: 'tcy', amount: 250000000n },
      })
    ).toBe('2.5 TCY')
  })

  it('shows an unlisted denom raw', () => {
    expect(
      formatCosmosSignDataCoin({
        chain: Chain.Cosmos,
        coin: { denom: 'ibc/ABC', amount: 42n },
      })
    ).toBe('42 ibc/ABC')
  })
})
