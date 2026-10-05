import { getCustomMessageHex } from '@core/ui/mpc/keysign/customMessage/getCustomMessageHex'
import { Chain } from '@vultisig/core-chain/Chain'
import { hashMessage, hexlify } from 'ethers'
import { describe, expect, it } from 'vitest'

import { getPersonalSignMessage } from './getPersonalSignMessage'

const getSignedDigest = (input: { message: string; bytesCount: number }) =>
  getCustomMessageHex({
    chain: Chain.Ethereum,
    method: 'personal_sign',
    message: getPersonalSignMessage(input),
  })

const withoutHexPrefix = (hash: string) => hash.slice(2)

describe('getPersonalSignMessage', () => {
  it('signs the EIP-191 hash of the message when bytesCount is correct', () => {
    const message = 'hello world!'

    expect(getSignedDigest({ message, bytesCount: 12 })).toBe(
      withoutHexPrefix(hashMessage(message))
    )
  })

  // Issue: bytesCount comes from the page and is never checked against the
  // message, so the popup shows one message while the signature covers another.
  // `it.fails` keeps CI green while the bug exists and fails once it is fixed,
  // at which point the `.fails` should be removed.
  it.fails(
    'signs the message that the popup shows, whatever bytesCount says',
    () => {
      const shownMessage = '2hello world!'

      expect(getSignedDigest({ message: shownMessage, bytesCount: 1 })).toBe(
        withoutHexPrefix(hashMessage(shownMessage))
      )
    }
  )

  it.fails('ignores a bytesCount that does not match a hex message', () => {
    const shownBytes = Uint8Array.from(
      Buffer.from('3268656c6c6f20776f726c6421', 'hex')
    )

    expect(
      getSignedDigest({ message: hexlify(shownBytes), bytesCount: 1 })
    ).toBe(withoutHexPrefix(hashMessage(shownBytes)))
  })
})
