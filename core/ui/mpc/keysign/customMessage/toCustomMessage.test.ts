import { describe, expect, it } from 'vitest'

import { getCustomMessageBytes } from './getCustomMessageBytes'
import { toCustomMessage } from './toCustomMessage'

const utf8 = (text: string) => new TextEncoder().encode(text)

describe('toCustomMessage', () => {
  it('keeps UTF-8 text as text', () => {
    expect(toCustomMessage(utf8('Sign in to example.com ✓'))).toBe(
      'Sign in to example.com ✓'
    )
  })

  it('sends bytes that are not UTF-8 as hex', () => {
    expect(toCustomMessage(new Uint8Array([0x68, 0xff, 0x00, 0x80]))).toBe(
      '0x68ff0080'
    )
  })

  it('sends text starting with 0x as hex, so it is not read as hex', () => {
    expect(toCustomMessage(utf8('0xdeadbeef'))).toBe(
      `0x${Buffer.from('0xdeadbeef').toString('hex')}`
    )
  })

  it.each([
    ['text', utf8('hello')],
    ['empty', new Uint8Array()],
    ['a leading byte order mark', new Uint8Array([0xef, 0xbb, 0xbf, 0x68])],
    ['invalid UTF-8', new Uint8Array([0x68, 0xff, 0x00, 0x80])],
    ['text starting with 0x', utf8('0x1234')],
  ])('reads back as exactly the same bytes for %s', (_, bytes) => {
    expect(
      new Uint8Array(getCustomMessageBytes(toCustomMessage(bytes)))
    ).toEqual(bytes)
  })
})
