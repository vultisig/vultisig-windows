import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

import { getCustomMessageHex } from './getCustomMessageHex'

const toHex = (bytes: Uint8Array) => `0x${Buffer.from(bytes).toString('hex')}`

// A minimal legacy Solana transaction message: 1 signer, 2 accounts, 1
// instruction with no data. This is what a transaction signature covers.
const buildSolanaTransactionMessage = () =>
  Uint8Array.from([
    ...[1, 0, 1],
    2,
    ...new Uint8Array(32).fill(1),
    ...new Uint8Array(32).fill(2),
    ...new Uint8Array(32).fill(3),
    1,
    ...[1, 1, 0, 0],
  ])

// XRPL transactions are signed over SHA-512-half of `STX\0` + the encoded tx.
const xrplSingleSigningPrefix = '0x53545800'

describe('getCustomMessageHex', () => {
  it('signs a plain text message on Solana as its raw bytes', () => {
    expect(
      getCustomMessageHex({
        chain: Chain.Solana,
        method: 'sign_message',
        message: 'Sign in to example.com',
      })
    ).toBe(Buffer.from('Sign in to example.com').toString('hex'))
  })

  // Issue: custom messages are signed as raw bytes with no domain separation,
  // so a transaction can go through the message flow and the signature works
  // as a transaction signature. `it.fails` keeps CI green while the bug
  // exists and fails once it is fixed, at which point remove the `.fails`.
  it.fails('refuses to sign a Solana transaction message as a message', () => {
    expect(() =>
      getCustomMessageHex({
        chain: Chain.Solana,
        method: 'sign_message',
        message: toHex(buildSolanaTransactionMessage()),
      })
    ).toThrow()
  })

  it.fails('refuses to sign an XRPL transaction hash as a message', () => {
    expect(() =>
      getCustomMessageHex({
        chain: Chain.Ripple,
        method: 'sign_message',
        message: `${xrplSingleSigningPrefix}120000220000000024000000016140000000000F424068400000000000000A`,
      })
    ).toThrow()
  })
})
