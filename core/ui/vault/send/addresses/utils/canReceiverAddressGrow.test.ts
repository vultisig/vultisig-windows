import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

import { canReceiverAddressGrow } from './canReceiverAddressGrow'

describe('canReceiverAddressGrow', () => {
  it('treats a short NEAR named account as possibly incomplete', () => {
    expect(canReceiverAddressGrow({ address: 'al', chain: Chain.Near })).toBe(
      true
    )
    expect(
      canReceiverAddressGrow({ address: 'alice.near', chain: Chain.Near })
    ).toBe(true)
  })

  it('treats a 64-character NEAR implicit account as complete', () => {
    expect(
      canReceiverAddressGrow({ address: 'a'.repeat(64), chain: Chain.Near })
    ).toBe(false)
  })

  it('treats a Solana address under 44 characters as possibly incomplete', () => {
    expect(
      canReceiverAddressGrow({ address: '1'.repeat(43), chain: Chain.Solana })
    ).toBe(true)
    expect(
      canReceiverAddressGrow({ address: '1'.repeat(44), chain: Chain.Solana })
    ).toBe(false)
  })

  it('treats addresses on other chains as complete', () => {
    expect(
      canReceiverAddressGrow({
        address: '0x0000000000000000000000000000000000000000',
        chain: Chain.Ethereum,
      })
    ).toBe(false)
  })
})
