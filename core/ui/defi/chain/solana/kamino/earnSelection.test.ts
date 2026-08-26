import { Chain } from '@vultisig/core-chain/Chain'
import { kaminoVaultRegistry } from '@vultisig/core-chain/chains/solana/kamino/registry'
import { describe, expect, it } from 'vitest'

import { resolveKaminoEarnSelection } from './earnSelection'
import { kaminoEarnPositionId } from './positionId'

const kaminoPositionIds = kaminoVaultRegistry.map(({ address }) =>
  kaminoEarnPositionId(address)
)

describe('resolveKaminoEarnSelection', () => {
  it('adds Solana and every curated vault to an untouched selection', () => {
    expect(
      resolveKaminoEarnSelection({ defiChains: [], defiPositions: {} })
    ).toEqual({
      defiChains: [Chain.Solana],
      defiPositions: { [Chain.Solana]: kaminoPositionIds },
    })
  })

  it('keeps the chains and positions of other chains', () => {
    const { defiChains, defiPositions } = resolveKaminoEarnSelection({
      defiChains: [Chain.THORChain],
      defiPositions: { [Chain.THORChain]: ['thor-stake-tcy'] },
    })

    expect(defiChains).toEqual([Chain.THORChain, Chain.Solana])
    expect(defiPositions).toEqual({
      [Chain.THORChain]: ['thor-stake-tcy'],
      [Chain.Solana]: kaminoPositionIds,
    })
  })

  it('writes nothing once Solana and the curated vaults are selected', () => {
    expect(
      resolveKaminoEarnSelection({
        defiChains: [Chain.Solana],
        defiPositions: { [Chain.Solana]: kaminoPositionIds },
      })
    ).toEqual({ defiChains: undefined, defiPositions: undefined })
  })

  it('leaves a partial vault selection alone rather than re-adding what was turned off', () => {
    const [firstVaultId] = kaminoPositionIds

    expect(
      resolveKaminoEarnSelection({
        defiChains: [Chain.Solana],
        defiPositions: { [Chain.Solana]: [firstVaultId] },
      }).defiPositions
    ).toBeUndefined()
  })

  it('honours a Solana selection that deliberately holds no Kamino vault', () => {
    expect(
      resolveKaminoEarnSelection({
        defiChains: [Chain.Solana],
        defiPositions: { [Chain.Solana]: ['solana-stake-sol'] },
      }).defiPositions
    ).toBeUndefined()
  })

  it('honours a Solana selection emptied of every position', () => {
    expect(
      resolveKaminoEarnSelection({
        defiChains: [Chain.Solana],
        defiPositions: { [Chain.Solana]: [] },
      }).defiPositions
    ).toBeUndefined()
  })

  it('still adds Solana to the chain list when its positions are already set', () => {
    expect(
      resolveKaminoEarnSelection({
        defiChains: [],
        defiPositions: { [Chain.Solana]: kaminoPositionIds },
      })
    ).toEqual({ defiChains: [Chain.Solana], defiPositions: undefined })
  })
})
