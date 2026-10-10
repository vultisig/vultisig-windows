import { getCustomMessageHex } from '@core/ui/mpc/keysign/customMessage/getCustomMessageHex'
import { OtherChain } from '@vultisig/core-chain/Chain'
import { hexlify, toUtf8Bytes } from 'ethers'
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

  it('passes a Solana text message through unchanged', () => {
    expect(
      getRawSignMessagePayload({
        chain: OtherChain.Solana,
        message: 'Sign in to example.com',
      })
    ).toBe('Sign in to example.com')
  })
})
