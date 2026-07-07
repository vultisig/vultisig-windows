import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

import { getInitialDefiPositions, resolveDefiPositions } from './defiPositions'

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
