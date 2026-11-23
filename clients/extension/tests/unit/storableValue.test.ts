import {
  fromStorableValue,
  toStorableValue,
} from '@clients/extension/src/storage/storableValue'
import { Buffer } from 'buffer'
import { describe, expect, it } from 'vitest'

describe('storable value', () => {
  it('round-trips bigint and byte fields through plain JSON', () => {
    const value = {
      amount: 12345678901234567890n,
      nested: [{ fee: 0n, data: new Uint8Array([1, 2, 3]) }],
      buffer: Buffer.from([4, 5]),
      label: 'kept',
    }

    const stored = toStorableValue(value)

    expect(JSON.parse(JSON.stringify(stored))).toEqual(stored)
    expect(fromStorableValue(stored)).toEqual({
      ...value,
      buffer: new Uint8Array([4, 5]),
    })
  })

  it('passes plain values through unchanged', () => {
    const value = { id: 'vault', state: { title: 'x', count: 1 } }

    expect(fromStorableValue(toStorableValue(value))).toEqual(value)
    expect(fromStorableValue(value)).toEqual(value)
  })

  it('keeps the JSON form of values with toJSON', () => {
    const date = new Date('2026-01-02T03:04:05.000Z')

    expect(toStorableValue({ date })).toEqual({ date: date.toISOString() })
  })
})
