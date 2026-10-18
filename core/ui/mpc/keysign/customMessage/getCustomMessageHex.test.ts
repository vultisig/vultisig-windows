import { Chain } from '@vultisig/core-chain/Chain'
import { hashMessage, TypedDataEncoder } from 'ethers'
import { describe, expect, it } from 'vitest'

import { customMessageSupportedChains } from './chains'
import { getCustomMessageHex } from './getCustomMessageHex'
import { getPersonalSignMessage } from './getPersonalSignMessage'

const substrateChains = [Chain.Polkadot, Chain.Bittensor] as const

const typedData = {
  domain: { name: 'Vultisig', chainId: 1 },
  types: { Mail: [{ name: 'contents', type: 'string' }] },
  primaryType: 'Mail',
  message: { contents: 'Hello from Vultisig' },
}

describe('getCustomMessageHex', () => {
  describe('EVM', () => {
    it('signs a personal_sign envelope as its EIP-191 hash', () => {
      expect(
        getCustomMessageHex({
          chain: Chain.Ethereum,
          method: 'personal_sign',
          message: getPersonalSignMessage('Hello from Vultisig'),
        })
      ).toBe(hashMessage('Hello from Vultisig').slice(2))
    })

    it('signs eth_signTypedData_v4 as its EIP-712 hash', () => {
      expect(
        getCustomMessageHex({
          chain: Chain.Ethereum,
          method: 'eth_signTypedData_v4',
          message: JSON.stringify(typedData),
        })
      ).toBe(
        TypedDataEncoder.hash(
          typedData.domain,
          typedData.types,
          typedData.message
        ).slice(2)
      )
    })

    it.each([
      ['another method', 'eth_sign', '0xdeadbeef'],
      ['personal_sign without an envelope', 'personal_sign', '0xdeadbeef'],
    ])('refuses %s', (_, method, message) => {
      expect(() =>
        getCustomMessageHex({ chain: Chain.Ethereum, method, message })
      ).toThrow('not a recognised signing format')
    })
  })

  describe.each(substrateChains)('%s signRaw', chain => {
    it('is accepted by the custom message pipeline', () => {
      expect(customMessageSupportedChains).toContain(chain)
    })

    it('passes hex payload bytes through unhashed for ed25519', () => {
      expect(
        getCustomMessageHex({
          chain,
          method: 'sign_message',
          message: '0x1234abcd',
        })
      ).toBe('1234abcd')
    })

    it('encodes a text payload as its UTF-8 bytes', () => {
      expect(
        getCustomMessageHex({ chain, method: 'sign_message', message: 'hello' })
      ).toBe(Buffer.from('hello', 'utf8').toString('hex'))
    })
  })
})
