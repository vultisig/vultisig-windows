import { ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import { TW } from '@trustwallet/wallet-core'
import { describe, expect, it } from 'vitest'

import { findAtaRecipient } from './parseTokenInstruction'

const publicKeyFromSeed = (seed: number) =>
  new PublicKey(new Uint8Array(32).fill(seed))

const staticKeys = [publicKeyFromSeed(1), publicKeyFromSeed(2)]
const loadedKeys = [
  ASSOCIATED_TOKEN_PROGRAM_ID,
  publicKeyFromSeed(3),
  publicKeyFromSeed(4),
]
const keys = [...staticKeys, ...loadedKeys]

const txWithInstructions = (
  instructions: TW.Solana.Proto.RawMessage.IInstruction[]
): TW.Solana.Proto.RawMessage.IMessageLegacy => ({
  accountKeys: staticKeys.map(key => key.toBase58()),
  instructions,
})

describe('findAtaRecipient', () => {
  it('resolves the recipient against the merged keys, not the static ones', () => {
    const tx = txWithInstructions([
      { programId: 2, accounts: [0, 1, 4], programData: new Uint8Array() },
    ])

    expect(findAtaRecipient({ tx, keys })?.toBase58()).toBe(
      publicKeyFromSeed(4).toBase58()
    )
  })

  it('returns undefined when the transaction creates no associated token account', () => {
    const tx = txWithInstructions([
      { programId: 1, accounts: [0, 1, 3], programData: new Uint8Array() },
    ])

    expect(findAtaRecipient({ tx, keys })).toBeUndefined()
  })

  it('fails closed when the owner index is outside the resolved keys', () => {
    const tx = txWithInstructions([
      { programId: 2, accounts: [0, 1, 9], programData: new Uint8Array() },
    ])

    expect(() => findAtaRecipient({ tx, keys })).toThrow()
  })

  it('fails closed when a program index is outside the resolved keys', () => {
    const tx = txWithInstructions([
      { programId: 9, accounts: [0, 1, 4], programData: new Uint8Array() },
    ])

    expect(() => findAtaRecipient({ tx, keys })).toThrow()
  })
})
