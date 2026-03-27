import { describe, expect, it } from 'vitest'

import { Chain } from '../Chain'
import { getSignatureAlgorithm } from './SignatureAlgorithm'

describe('getSignatureAlgorithm', () => {
  it('returns mldsa for QBTC', () => {
    expect(getSignatureAlgorithm(Chain.QBTC)).toBe('mldsa')
  })

  it('returns ecdsa for standard cosmos chains', () => {
    expect(getSignatureAlgorithm(Chain.Cosmos)).toBe('ecdsa')
    expect(getSignatureAlgorithm(Chain.Osmosis)).toBe('ecdsa')
    expect(getSignatureAlgorithm(Chain.THORChain)).toBe('ecdsa')
  })

  it('returns ecdsa for EVM chains', () => {
    expect(getSignatureAlgorithm(Chain.Ethereum)).toBe('ecdsa')
    expect(getSignatureAlgorithm(Chain.BSC)).toBe('ecdsa')
  })

  it('returns ecdsa for UTXO chains', () => {
    expect(getSignatureAlgorithm(Chain.Bitcoin)).toBe('ecdsa')
    expect(getSignatureAlgorithm(Chain.Litecoin)).toBe('ecdsa')
  })

  it('returns eddsa for Solana', () => {
    expect(getSignatureAlgorithm(Chain.Solana)).toBe('eddsa')
  })

  it('returns eddsa for Sui', () => {
    expect(getSignatureAlgorithm(Chain.Sui)).toBe('eddsa')
  })

  it('returns eddsa for Polkadot', () => {
    expect(getSignatureAlgorithm(Chain.Polkadot)).toBe('eddsa')
  })

  it('returns eddsa for Ton', () => {
    expect(getSignatureAlgorithm(Chain.Ton)).toBe('eddsa')
  })
})
