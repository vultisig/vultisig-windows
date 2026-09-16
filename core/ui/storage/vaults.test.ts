import { Chain } from '@vultisig/core-chain/Chain'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { Vault } from '@vultisig/core-mpc/vault/Vault'
import { describe, expect, it } from 'vitest'

import { mergeVaultsWithCoins } from './vaults'

describe('restored vault coin projection', () => {
  it('excludes retired chains without changing persisted coins or key material', () => {
    const vault: Vault = {
      name: 'Restore fixture',
      publicKeys: { ecdsa: 'fixture-id', eddsa: 'fixture-eddsa' },
      keyShares: { ecdsa: 'fixture-share', eddsa: 'fixture-share' },
      hexChainCode: 'fixture-code',
      signers: [],
      localPartyId: 'fixture-party',
      libType: 'DKLS',
      isBackedUp: true,
      order: 0,
    }
    const native: AccountCoin = {
      chain: Chain.Solana,
      address: 'fixture-address',
      ticker: 'SOL',
      decimals: 9,
    }
    const token: AccountCoin = {
      ...native,
      id: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      ticker: 'USDC',
      decimals: 6,
    }
    // JSON storage predates the SDK's current supported-chain union.
    const retired: AccountCoin = JSON.parse(
      '{"chain":"Kujira","address":"kujira1fixture","ticker":"KUJI","decimals":6}'
    )
    const input = {
      vaults: [vault],
      coins: {
        'fixture-id': [
          retired,
          { ...retired, id: 'factory/token' },
          native,
          token,
        ],
      },
    }
    const persisted = structuredClone(input)

    const [active] = mergeVaultsWithCoins(input)

    expect(active.coins).toStrictEqual([native, token])
    expect(active.keyShares).toStrictEqual(vault.keyShares)
    expect(input).toStrictEqual(persisted)
    expect(mergeVaultsWithCoins(input)).toStrictEqual([active])
  })
})
