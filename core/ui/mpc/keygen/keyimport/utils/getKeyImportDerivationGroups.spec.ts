import {
  Chain,
  CosmosChain,
  EvmChain,
  OtherChain,
  UtxoChain,
} from '@core/chain/Chain'
import { describe, expect, it } from 'vitest'

import { getKeyImportDerivationGroups } from './getKeyImportDerivationGroups'

describe('getKeyImportDerivationGroups', () => {
  it('groups all EVM chains into a single derivation group', () => {
    const chains: Chain[] = [
      EvmChain.Ethereum,
      EvmChain.Arbitrum,
      EvmChain.BSC,
      EvmChain.Polygon,
      EvmChain.Base,
      EvmChain.Optimism,
      EvmChain.Avalanche,
      EvmChain.CronosChain,
      EvmChain.Blast,
      EvmChain.Zksync,
      EvmChain.Mantle,
      EvmChain.Hyperliquid,
      EvmChain.Sei,
    ]

    const groups = getKeyImportDerivationGroups(chains)

    expect(groups).toHaveLength(1)
    expect(groups[0].representativeChain).toBe(EvmChain.Ethereum)
    expect(groups[0].chains).toEqual(chains)
  })

  it('groups THORChain and MayaChain together', () => {
    const chains: Chain[] = [CosmosChain.THORChain, CosmosChain.MayaChain]

    const groups = getKeyImportDerivationGroups(chains)

    expect(groups).toHaveLength(1)
    expect(groups[0].representativeChain).toBe(CosmosChain.THORChain)
    expect(groups[0].chains).toEqual(chains)
  })

  it('groups Cosmos-118 chains together', () => {
    const chains: Chain[] = [
      CosmosChain.Cosmos,
      CosmosChain.Kujira,
      CosmosChain.Dydx,
      CosmosChain.Osmosis,
      CosmosChain.Noble,
      CosmosChain.Akash,
    ]

    const groups = getKeyImportDerivationGroups(chains)

    expect(groups).toHaveLength(1)
    expect(groups[0].representativeChain).toBe(CosmosChain.Cosmos)
    expect(groups[0].chains).toEqual(chains)
  })

  it('groups Terra and TerraClassic together', () => {
    const chains: Chain[] = [CosmosChain.Terra, CosmosChain.TerraClassic]

    const groups = getKeyImportDerivationGroups(chains)

    expect(groups).toHaveLength(1)
    expect(groups[0].representativeChain).toBe(CosmosChain.Terra)
    expect(groups[0].chains).toEqual(chains)
  })

  it('keeps chains with unique derivation paths separate', () => {
    const chains: Chain[] = [
      UtxoChain.Bitcoin,
      UtxoChain.Litecoin,
      UtxoChain.Dogecoin,
      OtherChain.Solana,
      OtherChain.Ripple,
    ]

    const groups = getKeyImportDerivationGroups(chains)

    expect(groups).toHaveLength(5)
    groups.forEach(group => {
      expect(group.chains).toHaveLength(1)
      expect(group.representativeChain).toBe(group.chains[0])
    })
  })

  it('produces correct groups for a typical multi-chain selection', () => {
    const chains: Chain[] = [
      EvmChain.Ethereum,
      EvmChain.BSC,
      EvmChain.Polygon,
      UtxoChain.Bitcoin,
      CosmosChain.THORChain,
      CosmosChain.MayaChain,
      OtherChain.Solana,
    ]

    const groups = getKeyImportDerivationGroups(chains)

    expect(groups).toHaveLength(4)

    const evmGroup = groups.find(
      g => g.representativeChain === EvmChain.Ethereum
    )
    expect(evmGroup?.chains).toEqual([
      EvmChain.Ethereum,
      EvmChain.BSC,
      EvmChain.Polygon,
    ])

    const thorGroup = groups.find(
      g => g.representativeChain === CosmosChain.THORChain
    )
    expect(thorGroup?.chains).toEqual([
      CosmosChain.THORChain,
      CosmosChain.MayaChain,
    ])

    const btcGroup = groups.find(
      g => g.representativeChain === UtxoChain.Bitcoin
    )
    expect(btcGroup?.chains).toEqual([UtxoChain.Bitcoin])

    const solGroup = groups.find(
      g => g.representativeChain === OtherChain.Solana
    )
    expect(solGroup?.chains).toEqual([OtherChain.Solana])
  })

  it('uses the first chain in input order as the representative', () => {
    const chains: Chain[] = [EvmChain.Polygon, EvmChain.Ethereum, EvmChain.BSC]

    const groups = getKeyImportDerivationGroups(chains)

    expect(groups[0].representativeChain).toBe(EvmChain.Polygon)
  })

  it('preserves input order within each group', () => {
    const chains: Chain[] = [
      EvmChain.Blast,
      UtxoChain.Bitcoin,
      EvmChain.Ethereum,
      CosmosChain.THORChain,
      EvmChain.Arbitrum,
      CosmosChain.MayaChain,
    ]

    const groups = getKeyImportDerivationGroups(chains)

    const evmGroup = groups.find(g => g.chains.includes(EvmChain.Ethereum))
    expect(evmGroup?.chains).toEqual([
      EvmChain.Blast,
      EvmChain.Ethereum,
      EvmChain.Arbitrum,
    ])

    const thorGroup = groups.find(g => g.chains.includes(CosmosChain.THORChain))
    expect(thorGroup?.chains).toEqual([
      CosmosChain.THORChain,
      CosmosChain.MayaChain,
    ])
  })

  it('returns empty array for empty input', () => {
    const groups = getKeyImportDerivationGroups([])

    expect(groups).toEqual([])
  })

  it('handles a single chain', () => {
    const groups = getKeyImportDerivationGroups([EvmChain.Ethereum])

    expect(groups).toHaveLength(1)
    expect(groups[0].representativeChain).toBe(EvmChain.Ethereum)
    expect(groups[0].chains).toEqual([EvmChain.Ethereum])
  })
})
