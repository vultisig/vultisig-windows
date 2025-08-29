import {
  deserialize,
  serialize,
  type Serialized,
} from '@lib/extension/serialization'
import { describe, expect, it } from 'vitest'

describe('serialization', () => {
  it('roundtrips BigInt', () => {
    const input = { a: 12345678901234567890n }
    const s: Serialized<typeof input> = serialize(input)
    expect(typeof s).toBe('string')
    const parsed = JSON.parse(s as string)
    expect(parsed.a.__s).toBe('bigint')
    const restored = deserialize<typeof input>(s)
    expect(restored).toEqual(input)
  })

  it('roundtrips Uint8Array', () => {
    const bytes = new Uint8Array([0, 1, 2, 253, 254, 255])
    const input = { bytes }
    const s = serialize(input)
    const parsed = JSON.parse(s as string)
    expect(parsed.bytes.__s).toBe('u8a')
    const restored = deserialize<typeof input>(s)
    expect(restored.bytes).toEqual(bytes)
  })

  it('roundtrips nested structures', () => {
    const input = {
      list: [1n, 2n, new Uint8Array([9, 8, 7])],
      nested: { b: 3n, u: new Uint8Array([10]) },
      plain: { x: 'y' },
    }
    const s = serialize(input)
    const restored = deserialize<typeof input>(s)
    expect(restored.plain).toEqual(input.plain)
    expect(restored.list[0]).toEqual(1n)
    expect(restored.list[1]).toEqual(2n)
    expect(restored.list[2]).toEqual(new Uint8Array([9, 8, 7]))
    expect(restored.nested.b).toEqual(3n)
    expect(restored.nested.u).toEqual(new Uint8Array([10]))
  })
})
