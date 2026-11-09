import { getCustomMessageHex } from '@core/ui/mpc/keysign/customMessage/getCustomMessageHex'
import { isSignableCustomMessage } from '@core/ui/mpc/keysign/customMessage/isSignableCustomMessage'
import { OtherChain, UtxoChain } from '@vultisig/core-chain/Chain'
import { hexlify, sha256, toUtf8Bytes } from 'ethers'
import { describe, expect, it } from 'vitest'

import { getRawSignMessagePayload } from './getRawSignMessagePayload'

const utf8Hex = (text: string) => hexlify(toUtf8Bytes(text))

describe('getRawSignMessagePayload', () => {
  describe('Polkadot signRaw', () => {
    it('wraps hex data in <Bytes>…</Bytes>', () => {
      expect(
        getRawSignMessagePayload({
          chain: OtherChain.Polkadot,
          message: utf8Hex('Sign in to example.com'),
        })
      ).toBe(utf8Hex('<Bytes>Sign in to example.com</Bytes>'))
    })

    it('makes the keysign sign the wrapped bytes', () => {
      const extrinsicPayload = '0x0500a8c3f2e1d0'
      const message = getRawSignMessagePayload({
        chain: OtherChain.Polkadot,
        message: extrinsicPayload,
      })

      expect(
        getCustomMessageHex({
          chain: OtherChain.Polkadot,
          message,
          method: 'sign_message',
        })
      ).toBe(
        Buffer.concat([
          Buffer.from('<Bytes>'),
          Buffer.from(extrinsicPayload.slice(2), 'hex'),
          Buffer.from('</Bytes>'),
        ]).toString('hex')
      )
    })

    it('wraps plain text data', () => {
      expect(
        getRawSignMessagePayload({ chain: OtherChain.Polkadot, message: 'hi' })
      ).toBe(utf8Hex('<Bytes>hi</Bytes>'))
    })

    it('does not wrap data that is already wrapped', () => {
      const wrapped = utf8Hex('<Bytes>hi</Bytes>')

      expect(
        getRawSignMessagePayload({
          chain: OtherChain.Polkadot,
          message: wrapped,
        })
      ).toBe(wrapped)
    })

    it('wraps Ethereum-prefixed data', () => {
      const message = utf8Hex('\x19Ethereum Signed Message:\n2hi')

      expect(
        getRawSignMessagePayload({ chain: OtherChain.Polkadot, message })
      ).toBe(utf8Hex('<Bytes>\x19Ethereum Signed Message:\n2hi</Bytes>'))
    })

    it('wraps Bittensor data the same way', () => {
      expect(
        getRawSignMessagePayload({
          chain: OtherChain.Bittensor,
          message: utf8Hex('hi'),
        })
      ).toBe(utf8Hex('<Bytes>hi</Bytes>'))
    })
  })

  describe('TRON v1', () => {
    const hash = 'ab'.repeat(32)

    it('prefixes the hex bytes with the TRON header', () => {
      expect(
        getRawSignMessagePayload({
          chain: OtherChain.Tron,
          message: hash,
          useTronHeader: true,
        })
      ).toBe(`${utf8Hex('\x19TRON Signed Message:\n32')}${hash}`)
    })

    it('drops a 0x prefix, as TronWeb does', () => {
      expect(
        getRawSignMessagePayload({
          chain: OtherChain.Tron,
          message: `0x${hash}`,
          useTronHeader: true,
        })
      ).toBe(
        getRawSignMessagePayload({
          chain: OtherChain.Tron,
          message: hash,
          useTronHeader: true,
        })
      )
    })
  })

  it.each([
    ['a v2 message', { message: 'Sign in to example.com', isV2: true }],
    [
      'a v1 message under the TRON header',
      { message: 'ab'.repeat(32), useTronHeader: true },
    ],
    ['a v1 message under the Ethereum header', { message: 'ab'.repeat(32) }],
    ['a short v1 message', { message: 'abcd', useTronHeader: true }],
  ])('builds %s that the keysign accepts', (_, input) => {
    expect(
      isSignableCustomMessage({
        chain: OtherChain.Tron,
        method: 'sign_message',
        message: getRawSignMessagePayload({ chain: OtherChain.Tron, ...input }),
      })
    ).toBe(true)
  })

  describe('Bitcoin', () => {
    it('wraps the UTF-8 text in the Bitcoin signed-message envelope', () => {
      expect(
        getRawSignMessagePayload({
          chain: UtxoChain.Bitcoin,
          message: 'Sign in',
        })
      ).toBe(
        hexlify(
          Buffer.concat([
            Buffer.from([24]),
            Buffer.from('Bitcoin Signed Message:\n'),
            Buffer.from([7]),
            Buffer.from('Sign in'),
          ])
        )
      )
    })

    it.each(['Vires is Numeris', '0xdeadbeef'])(
      'makes the keysign sign the text %j as a Bitcoin message',
      message => {
        const payload = getRawSignMessagePayload({
          chain: UtxoChain.Bitcoin,
          message,
        })

        expect(
          getCustomMessageHex({
            chain: UtxoChain.Bitcoin,
            message: payload,
            method: 'sign_message',
          })
        ).toBe(
          sha256(
            sha256(
              Buffer.concat([
                Buffer.from('\x18Bitcoin Signed Message:\n'),
                Buffer.from([Buffer.byteLength(message)]),
                Buffer.from(message),
              ])
            )
          ).slice(2)
        )
      }
    )
  })

  it('passes a Solana text message through unchanged', () => {
    expect(
      getRawSignMessagePayload({
        chain: OtherChain.Solana,
        message: 'Sign in to example.com',
      })
    ).toBe('Sign in to example.com')
  })
})
