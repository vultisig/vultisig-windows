import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

import { customMessageSupportedChains } from './chains'
import { getCustomMessageHex } from './getCustomMessageHex'

const substrateChains = [Chain.Polkadot, Chain.Bittensor] as const

describe('getCustomMessageHex', () => {
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
