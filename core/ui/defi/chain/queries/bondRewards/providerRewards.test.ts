import { describe, expect, it } from 'vitest'

import {
  getBondProviderReward,
  getMayachainBondProviderRewards,
  getThorchainBondProviderRewards,
} from './providerRewards'

// THORNode node thor10czf2s89h79fsjmqqck85cdqeq536hw5ngz4lt at height
// 27914369, one block before churn 27914370: the top provider held
// 29511174914053 of the 112307744558083 bond, and the rest is folded into one
// provider so the totals stay the mainnet values.
const topProviderAddress = 'thor18zg6y8ylus8n3tpzu5xxge3yyquj03vylstrl3'
const mainnetSnapshot = {
  award: 103341961766n,
  operatorFeeBps: 2000n,
  providers: [
    { bond_address: topProviderAddress, bond: '29511174914053' },
    { bond_address: 'thor1everyoneelse', bond: '82796569644030' },
  ],
}

describe('getThorchainBondProviderRewards', () => {
  it('pays the top provider its bond share of the award after the operator fee', () => {
    const rewards = getThorchainBondProviderRewards(mainnetSnapshot)

    expect(rewards[topProviderAddress]).toBe(21724184536n)
    expect(rewards['thor1everyoneelse']).toBe(60949384875n)
  })

  it('merges repeated rows of one provider, whatever their case', () => {
    const rewards = getThorchainBondProviderRewards({
      award: 1000n,
      operatorFeeBps: 0n,
      providers: [
        { bond_address: 'thor1ME', bond: '1' },
        { bond_address: 'thor1me', bond: '1' },
        { bond_address: 'thor1other', bond: '2' },
      ],
    })

    expect(rewards).toEqual({ thor1me: 500n, thor1other: 500n })
  })

  it('keeps a provider with nothing bonded instead of dividing by zero', () => {
    const rewards = getThorchainBondProviderRewards({
      award: 1000n,
      operatorFeeBps: 0n,
      providers: [{ bond_address: 'thor1me', bond: '0' }],
    })

    expect(rewards).toEqual({ thor1me: 0n })
  })

  it('leaves nothing for providers when the fee is the whole award or more', () => {
    const rewards = getThorchainBondProviderRewards({
      award: 1000n,
      operatorFeeBps: 12_000n,
      providers: [{ bond_address: 'thor1me', bond: '100' }],
    })

    expect(rewards).toEqual({ thor1me: 0n })
  })
})

describe('getMayachainBondProviderRewards', () => {
  it('reads each provider row as its payout', () => {
    // MAYANode block 17904022: the rows already carry the operator fee, and
    // their LP units are not comparable across pools.
    const rewards = getMayachainBondProviderRewards([
      { bond_address: 'maya1other', reward: '1050300962182' },
      { bond_address: 'maya1me', reward: '5950393313942' },
    ])

    expect(rewards).toEqual({
      maya1other: 1050300962182n,
      maya1me: 5950393313942n,
    })
  })
})

describe('getBondProviderReward', () => {
  it('finds the address whatever its case', () => {
    expect(
      getBondProviderReward({
        rewards: { thor1me: 7n },
        bondAddress: 'THOR1ME',
      })
    ).toBe(7n)
  })

  it('is null for an address that was not a bond provider', () => {
    expect(
      getBondProviderReward({
        rewards: { thor1other: 7n },
        bondAddress: 'thor1me',
      })
    ).toBeNull()
  })
})
