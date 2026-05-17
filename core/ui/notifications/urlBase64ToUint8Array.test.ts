import { describe, expect, it } from 'vitest'

import { urlBase64ToUint8Array } from './urlBase64ToUint8Array'

describe('urlBase64ToUint8Array', () => {
  it('decodes unpadded URL-safe base64', () => {
    expect(Array.from(urlBase64ToUint8Array('aGVsbG8'))).toEqual([
      104, 101, 108, 108, 111,
    ])
  })

  it('trims whitespace around server-provided keys', () => {
    expect(Array.from(urlBase64ToUint8Array(' aGVsbG8\n'))).toEqual([
      104, 101, 108, 108, 111,
    ])
  })
})
