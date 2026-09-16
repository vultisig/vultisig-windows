import { Chain } from '@vultisig/core-chain/Chain'
import { knownTokens } from '@vultisig/core-chain/coin/knownTokens'
import { describe, expect, it } from 'vitest'

import {
  getInitialDefiPositions,
  mapLpPoolsToPositions,
  resolveDefiPositions,
} from './defiPositions'

describe('getInitialDefiPositions', () => {
  it('keeps Vultisig first-run DeFi positions empty', () => {
    expect(getInitialDefiPositions('vultisig')).toEqual({})
  })

  it('enables Terra and Terra Classic staking positions for Station first-run DeFi', () => {
    expect(getInitialDefiPositions('station')).toEqual({
      [Chain.Terra]: ['terra-stake-luna'],
      [Chain.TerraClassic]: ['terraclassic-stake-lunc'],
    })
  })
})

describe('resolveDefiPositions', () => {
  it('uses Station defaults when storage is missing', () => {
    expect(
      resolveDefiPositions({
        productBrand: 'station',
      })
    ).toEqual({
      [Chain.Terra]: ['terra-stake-luna'],
      [Chain.TerraClassic]: ['terraclassic-stake-lunc'],
    })
  })

  it('respects saved empty Station position settings', () => {
    expect(
      resolveDefiPositions({
        storedPositions: {},
        productBrand: 'station',
      })
    ).toEqual({})
  })
})

describe('provider-encoded pool identifiers', () => {
  it('retains the canonical Tron contract from a provider-uppercase asset', () => {
    const tokens = knownTokens[Chain.Tron]
    tokens.unshift({
      chain: Chain.Tron,
      id: 'unrelated-token',
      ticker: 'USDT',
      decimals: 18,
      logo: 'other',
    })
    try {
      const [position] = mapLpPoolsToPositions({
        chain: Chain.THORChain,
        pools: [{ asset: 'TRON.USDT-TR7NHQJEKQXGTCI8Q8ZY4PL8OTSZGJLJ6T' }],
      })
      expect(position.coin).toMatchObject({
        chain: Chain.Tron,
        id: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
        ticker: 'USDT',
        decimals: 6,
        priceProviderId: 'tether',
      })
    } finally {
      tokens.shift()
    }
  })
})

describe('pool ticker aliases', () => {
  it('keeps bridged Arbitrum USDC identity when the provider omits its display suffix', () => {
    const [position] = mapLpPoolsToPositions({
      chain: Chain.THORChain,
      pools: [{ asset: 'ARB.USDC-0XFF970A61A04B1CA14834A43F5DE4533EBDDB5CC8' }],
    })
    expect(position.coin?.id?.toLowerCase()).toBe(
      '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8'
    )
  })
})
