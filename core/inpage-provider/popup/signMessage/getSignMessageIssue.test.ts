import { TonSignDataPayload } from '@core/ui/mpc/keysign/customMessage/ton/tonSignData'
import {
  Keypair,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js'
import { EvmChain, OtherChain } from '@vultisig/core-chain/Chain'
import { hexlify, toUtf8Bytes } from 'ethers'
import { describe, expect, it } from 'vitest'

import { SignMessageInput } from '../interface'
import { getSignMessageIssue } from './getSignMessageIssue'

const requestOrigin = 'https://app.example.com'

const check = (input: SignMessageInput) =>
  getSignMessageIssue({ input, requestOrigin })

const signInText = [
  'app.example.com wants you to sign in with your account:',
  'EQCmBAn_latV6yLWm391BEFTWP7jZX5mUFJ4Dc5TJAnvVkCz',
  '',
  'Nonce: 8f3c2a91',
  'Issued At: 2026-10-06T10:00:00Z',
].join('\n')

const buildSolanaTransferMessage = () => {
  const payer = Keypair.generate().publicKey
  return new TransactionMessage({
    payerKey: payer,
    recentBlockhash: Keypair.generate().publicKey.toBase58(),
    instructions: [
      SystemProgram.transfer({
        fromPubkey: payer,
        toPubkey: Keypair.generate().publicKey,
        lamports: 1_000_000,
      }),
    ],
  })
}

const solanaMessage = (message: string): SignMessageInput => ({
  sign_message: { chain: OtherChain.Solana, message },
})

const rippleMessage = (message: string, isHex: boolean): SignMessageInput => ({
  sign_message: { chain: OtherChain.Ripple, message, isHex },
})

describe('getSignMessageIssue', () => {
  describe('Solana', () => {
    it('accepts a plain text sign-in message', () => {
      expect(check(solanaMessage(signInText))).toBeUndefined()
    })

    it('accepts a hex-encoded text message', () => {
      expect(
        check(solanaMessage(hexlify(toUtf8Bytes(signInText))))
      ).toBeUndefined()
    })

    it('rejects a legacy transaction message', () => {
      const bytes = buildSolanaTransferMessage()
        .compileToLegacyMessage()
        .serialize()

      expect(check(solanaMessage(hexlify(bytes)))).toMatch(/transaction/)
    })

    it('rejects a v0 transaction message', () => {
      const bytes = buildSolanaTransferMessage()
        .compileToV0Message()
        .serialize()

      expect(check(solanaMessage(hexlify(bytes)))).toMatch(/transaction/)
    })

    it('rejects a whole serialized transaction', () => {
      const bytes = new VersionedTransaction(
        buildSolanaTransferMessage().compileToV0Message()
      ).serialize()

      expect(check(solanaMessage(hexlify(bytes)))).toMatch(/transaction/)
    })
  })

  describe('XRPL', () => {
    it('accepts a plain text message', () => {
      expect(check(rippleMessage(signInText, false))).toBeUndefined()
    })

    it('accepts a hex message without a signing prefix', () => {
      expect(
        check(rippleMessage(hexlify(toUtf8Bytes('hello')).slice(2), true))
      ).toBeUndefined()
    })

    it.each([
      ['single-signed transaction', '53545800'],
      ['multi-signed transaction', '534D5400'],
      ['payment channel claim', '434C4D00'],
      ['batch', '42434800'],
    ])('rejects a %s signing payload', (_, prefix) => {
      expect(check(rippleMessage(`${prefix}1200002280000000`, true))).toMatch(
        /signing payload/
      )
    })

    it('rejects a text message whose bytes carry a signing prefix', () => {
      expect(check(rippleMessage('STX\u0000payload', false))).toMatch(
        /signing payload/
      )
    })

    it('rejects malformed hex', () => {
      expect(check(rippleMessage('zz', true))).toMatch(/not valid hex/)
    })
  })

  describe('raw TON', () => {
    it('rejects a raw TON message, which could be a transfer hash', () => {
      const input: SignMessageInput = JSON.parse(
        JSON.stringify({
          sign_message: {
            chain: OtherChain.Ton,
            message: `0x${'ab'.repeat(32)}`,
          },
        })
      )

      expect(check(input)).toMatch(/not supported/)
    })
  })

  describe('ton_proof', () => {
    const tonProof = (
      overrides: Partial<{ domain: string; timestamp: number }> = {}
    ): SignMessageInput => ({
      ton_proof: {
        chain: OtherChain.Ton,
        domain: 'app.example.com',
        timestamp: 1700000000,
        payload: 'nonce-123',
        ...overrides,
      },
    })

    it('accepts a well-formed proof request', () => {
      expect(check(tonProof())).toBeUndefined()
    })

    it('rejects a domain that is not a bare hostname', () => {
      expect(check(tonProof({ domain: 'app.example.com/path' }))).toMatch(
        /hostname/
      )
    })

    it('rejects a negative timestamp', () => {
      expect(check(tonProof({ timestamp: -1 }))).toMatch(/timestamp/)
    })
  })

  describe('ton_sign_data', () => {
    const signData = (payload: TonSignDataPayload): SignMessageInput => ({
      ton_sign_data: { chain: OtherChain.Ton, timestamp: 1700000000, payload },
    })

    it('accepts a text payload', () => {
      expect(check(signData({ type: 'text', text: 'Hello' }))).toBeUndefined()
    })

    it('rejects binary data that is not base64', () => {
      expect(check(signData({ type: 'binary', bytes: 'not base64!' }))).toMatch(
        /base64/
      )
    })

    it('rejects a request from an origin without a hostname', () => {
      expect(
        getSignMessageIssue({
          input: signData({ type: 'text', text: 'Hello' }),
          requestOrigin: 'null',
        })
      ).toMatch(/hostname/)
    })
  })

  it('leaves other methods alone', () => {
    expect(
      check({
        personal_sign: {
          chain: EvmChain.Ethereum,
          message: signInText,
          type: 'default',
        },
      })
    ).toBeUndefined()
  })
})
