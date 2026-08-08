import { Chain } from '@vultisig/core-chain/Chain'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { Vault } from '@vultisig/core-mpc/vault/Vault'
import { describe, expect, it } from 'vitest'

import { getLimitSwapKeysignPayloadInput } from './keysignPayloadInput'

const fromCoin: AccountCoin = {
  chain: Chain.THORChain,
  address: 'thor1sender',
  ticker: 'RUNE',
  decimals: 8,
}

const toCoin: AccountCoin = {
  chain: Chain.Bitcoin,
  address: 'bc1qbuyer',
  ticker: 'BTC',
  decimals: 8,
}

const fromPublicKey = { data: () => new Uint8Array([1]) } as never
const toPublicKey = { data: () => new Uint8Array([2]) } as never
const walletCore = {} as never

const vault = {
  name: 'Main Vault',
  publicKeys: { ecdsa: 'ecdsa-key', eddsa: 'eddsa-key' },
  hexChainCode: 'chain-code',
  localPartyId: 'device-1',
  signers: ['device-1', 'device-2'],
  libType: 'DKLS',
  isBackedUp: true,
  order: 0,
} as unknown as Vault

const memo = '=<:BTC.BTC:bc1qbuyer:1600000000/14400/0:v0:50'

const input = {
  fromCoin,
  toCoin,
  amount: 100_000_000n,
  memo,
  expectedToAmount: 1_600_000_000n,
  vault,
  fromPublicKey,
  toPublicKey,
  walletCore,
}

describe('getLimitSwapKeysignPayloadInput', () => {
  it('passes the composed order through unchanged', () => {
    const result = getLimitSwapKeysignPayloadInput(input)

    expect(result.fromCoin).toBe(fromCoin)
    expect(result.toCoin).toBe(toCoin)
    expect(result.amount).toBe(100_000_000n)
    expect(result.memo).toBe(memo)
  })

  // The memo is the order; a mangled one signs something the user never saw.
  it('does not rewrite the memo', () => {
    expect(getLimitSwapKeysignPayloadInput(input).memo).toBe(memo)
  })

  // Amounts stay bigint into signing — a Number round-trip would lose precision
  // and could emit scientific notation on a co-signer.
  it('keeps amounts as bigints', () => {
    const result = getLimitSwapKeysignPayloadInput(input)

    expect(typeof result.amount).toBe('bigint')
    expect(typeof result.expectedToAmount).toBe('bigint')
    expect(result.expectedToAmount).toBe(1_600_000_000n)
  })

  it('derives the vault identity from the vault', () => {
    const result = getLimitSwapKeysignPayloadInput(input)

    expect(result.vaultId).toBe('ecdsa-key')
    expect(result.localPartyId).toBe('device-1')
    expect(result.libType).toBe('DKLS')
  })

  // Both keys share a type, so a swap between them type-checks but would sign
  // against the wrong chain's key.
  it('keeps the from and to public keys on their own sides', () => {
    const result = getLimitSwapKeysignPayloadInput(input)

    expect(result.fromPublicKey).toBe(fromPublicKey)
    expect(result.toPublicKey).toBe(toPublicKey)
    expect(result.fromPublicKey).not.toBe(result.toPublicKey)
  })

  it('forwards walletCore for the signing build', () => {
    expect(getLimitSwapKeysignPayloadInput(input).walletCore).toBe(walletCore)
  })

  it('carries a same-chain pair without collapsing the sides', () => {
    const result = getLimitSwapKeysignPayloadInput({
      ...input,
      toCoin: { ...toCoin, chain: Chain.THORChain, ticker: 'TCY' },
    })

    expect(result.fromCoin.ticker).toBe('RUNE')
    expect(result.toCoin.ticker).toBe('TCY')
  })
})
