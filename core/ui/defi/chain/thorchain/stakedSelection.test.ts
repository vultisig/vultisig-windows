import { getDefaultStakePositionIds } from '@core/ui/storage/defiPositions'
import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

import { resolveThorchainStakedSelection } from './stakedSelection'

const thorStakePositionIds = getDefaultStakePositionIds(Chain.THORChain)

describe('resolveThorchainStakedSelection', () => {
  it('adds THORChain and its stake positions to an untouched selection', () => {
    expect(
      resolveThorchainStakedSelection({ defiChains: [], defiPositions: {} })
    ).toEqual({
      defiChains: [Chain.THORChain],
      defiPositions: { [Chain.THORChain]: thorStakePositionIds },
    })
  })

  it('seeds the RUJI and TCY stake positions but never bond', () => {
    const { defiPositions } = resolveThorchainStakedSelection({
      defiChains: [],
      defiPositions: {},
    })

    expect(defiPositions?.[Chain.THORChain]).toEqual(
      expect.arrayContaining(['thor-stake-ruji', 'thor-stake-tcy'])
    )
    expect(defiPositions?.[Chain.THORChain]).not.toContain('thor-bond-rune')
  })

  it('keeps the chains and positions of other chains', () => {
    const { defiChains, defiPositions } = resolveThorchainStakedSelection({
      defiChains: [Chain.Solana],
      defiPositions: { [Chain.Solana]: ['solana-stake-sol'] },
    })

    expect(defiChains).toEqual([Chain.Solana, Chain.THORChain])
    expect(defiPositions?.[Chain.Solana]).toEqual(['solana-stake-sol'])
  })

  it('writes nothing once THORChain and its stake positions are selected', () => {
    expect(
      resolveThorchainStakedSelection({
        defiChains: [Chain.THORChain],
        defiPositions: { [Chain.THORChain]: thorStakePositionIds },
      })
    ).toEqual({ defiChains: undefined, defiPositions: undefined })
  })

  it('leaves a partial position selection alone rather than re-adding what was turned off', () => {
    expect(
      resolveThorchainStakedSelection({
        defiChains: [Chain.THORChain],
        defiPositions: { [Chain.THORChain]: ['thor-stake-tcy'] },
      }).defiPositions
    ).toBeUndefined()
  })

  it('honours a THORChain selection that deliberately holds no stake position', () => {
    expect(
      resolveThorchainStakedSelection({
        defiChains: [Chain.THORChain],
        defiPositions: { [Chain.THORChain]: ['thor-bond-rune'] },
      }).defiPositions
    ).toBeUndefined()
  })

  it('honours a THORChain selection emptied of every position', () => {
    expect(
      resolveThorchainStakedSelection({
        defiChains: [Chain.THORChain],
        defiPositions: { [Chain.THORChain]: [] },
      }).defiPositions
    ).toBeUndefined()
  })

  it('still adds THORChain to the chain list when its positions are already set', () => {
    const { defiChains, defiPositions } = resolveThorchainStakedSelection({
      defiChains: [],
      defiPositions: { [Chain.THORChain]: ['thor-stake-ruji'] },
    })

    expect(defiChains).toEqual([Chain.THORChain])
    expect(defiPositions).toBeUndefined()
  })
})
