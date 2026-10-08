import { Chain } from '@vultisig/core-chain/Chain'
import { hashMessage, hexlify, toUtf8Bytes } from 'ethers'
import { describe, expect, it } from 'vitest'

import { getCustomMessageHex } from './getCustomMessageHex'
import { getPersonalSignMessage } from './getPersonalSignMessage'

const getSignedDigest = (message: string) =>
  getCustomMessageHex({
    chain: Chain.Ethereum,
    method: 'personal_sign',
    message: getPersonalSignMessage(message),
  })

const withoutHexPrefix = (hash: string) => hash.slice(2)

describe('getPersonalSignMessage', () => {
  it('signs the EIP-191 hash of a text message', () => {
    const message = 'hello world!'

    expect(getSignedDigest(message)).toBe(
      withoutHexPrefix(hashMessage(message))
    )
  })

  it('signs the EIP-191 hash of a hex message', () => {
    const bytes = toUtf8Bytes('hello world!')

    expect(getSignedDigest(hexlify(bytes))).toBe(
      withoutHexPrefix(hashMessage(bytes))
    )
  })

  it('uses the UTF-8 byte length, not the character count, for text', () => {
    const message = 'héllo 👋'

    expect(getPersonalSignMessage(message)).toBe(
      `\x19Ethereum Signed Message:\n11${message}`
    )
  })

  // Issue #5119: the length used to come from the page, so a message starting
  // with digits could have its start swallowed into the prefix.
  it('signs the message that the popup shows when it starts with digits', () => {
    const shownMessage = '2hello world!'

    expect(getSignedDigest(shownMessage)).toBe(
      withoutHexPrefix(hashMessage(shownMessage))
    )
  })

  it('signs the hex message that the popup shows when it starts with digits', () => {
    const shownBytes = toUtf8Bytes('2hello world!')

    expect(getSignedDigest(hexlify(shownBytes))).toBe(
      withoutHexPrefix(hashMessage(shownBytes))
    )
  })
})
