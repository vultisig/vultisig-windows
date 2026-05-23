import { describe, expect, it } from 'vitest'

import { normalizeKeplrBytes } from '@clients/extension/src/inpage/providers/cosmos/normalizeKeplrBytes'

describe('normalizeKeplrBytes', () => {
  const fixture = new Uint8Array([0x0a, 0xb4, 0x01, 0x0a, 0x38, 0x2f, 0x6f])
  const fixtureHex = Buffer.from(fixture).toString('hex')

  it('returns the same Uint8Array unchanged', () => {
    const result = normalizeKeplrBytes(fixture)
    expect(result).toBeInstanceOf(Uint8Array)
    expect(Array.from(result)).toEqual(Array.from(fixture))
  })

  it('decodes `__uint8array__<hex>` strings (Keplr JSONUint8Array wrapping)', () => {
    const wrapped = `__uint8array__${fixtureHex}`
    const result = normalizeKeplrBytes(wrapped)
    expect(Array.from(result)).toEqual(Array.from(fixture))
  })

  it('accepts a plain number[] array (JSON.parse of a Uint8Array)', () => {
    const result = normalizeKeplrBytes(Array.from(fixture))
    expect(Array.from(result)).toEqual(Array.from(fixture))
  })

  it('accepts the Node `{type:"Buffer", data:[]}` Buffer.toJSON shape', () => {
    const bufferShaped = { type: 'Buffer', data: Array.from(fixture) }
    const result = normalizeKeplrBytes(bufferShaped)
    expect(Array.from(result)).toEqual(Array.from(fixture))
  })

  it('handles empty `__uint8array__` (zero-length payload)', () => {
    const result = normalizeKeplrBytes('__uint8array__')
    expect(result.length).toBe(0)
  })

  it('throws on plain strings that lack the `__uint8array__` prefix', () => {
    expect(() => normalizeKeplrBytes('not-a-wrapped-array')).toThrow()
  })

  it('throws on plain objects without the Buffer shape', () => {
    expect(() => normalizeKeplrBytes({ foo: 'bar' })).toThrow()
  })

  it('throws on null and undefined', () => {
    expect(() => normalizeKeplrBytes(null)).toThrow()
    expect(() => normalizeKeplrBytes(undefined)).toThrow()
  })

  it('throws on a numeric primitive (not an array)', () => {
    expect(() => normalizeKeplrBytes(42)).toThrow()
  })
})
