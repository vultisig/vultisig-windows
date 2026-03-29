import { describe, expect, it } from 'vitest'

import {
  concatBytes,
  protoBytes,
  protoString,
  protoVarint,
} from './protoEncoding'

describe('protoEncoding', () => {
  describe('protoVarint', () => {
    it('returns empty for value 0 (proto3 default)', () => {
      expect(protoVarint(1, 0n)).toEqual(new Uint8Array(0))
    })

    it('encodes single-byte varint', () => {
      // field 1, wire type 0, value 1 → tag=0x08, value=0x01
      const result = protoVarint(1, 1n)
      expect(result).toEqual(new Uint8Array([0x08, 0x01]))
    })

    it('encodes multi-byte varint', () => {
      // field 4, wire type 0, value 300
      // tag = (4 << 3 | 0) = 32 = 0x20
      // 300 = 0x12C → varint: 0xAC 0x02
      const result = protoVarint(4, 300n)
      expect(result).toEqual(new Uint8Array([0x20, 0xac, 0x02]))
    })

    it('encodes large varint', () => {
      // field 1, value 200000
      // tag = 0x08
      // 200000 = 0x30D40 → varint: 0xC0 0x9A 0x0C
      const result = protoVarint(1, 200000n)
      expect(result).toEqual(new Uint8Array([0x08, 0xc0, 0x9a, 0x0c]))
    })
  })

  describe('protoBytes', () => {
    it('returns empty for empty data', () => {
      expect(protoBytes(1, new Uint8Array(0))).toEqual(new Uint8Array(0))
    })

    it('encodes bytes with length prefix', () => {
      // field 1, wire type 2 → tag = 0x0A
      const data = new Uint8Array([0x01, 0x02, 0x03])
      const result = protoBytes(1, data)
      expect(result).toEqual(new Uint8Array([0x0a, 0x03, 0x01, 0x02, 0x03]))
    })
  })

  describe('protoString', () => {
    it('returns empty for empty string', () => {
      expect(protoString(1, '')).toEqual(new Uint8Array(0))
    })

    it('encodes UTF-8 string', () => {
      // field 2, wire type 2 → tag = 0x12
      // "qbtc" = [0x71, 0x62, 0x74, 0x63], length 4
      const result = protoString(2, 'qbtc')
      expect(result).toEqual(
        new Uint8Array([0x12, 0x04, 0x71, 0x62, 0x74, 0x63])
      )
    })
  })

  describe('concatBytes', () => {
    it('concatenates multiple arrays', () => {
      const a = new Uint8Array([1, 2])
      const b = new Uint8Array([3])
      const c = new Uint8Array([4, 5, 6])
      expect(concatBytes(a, b, c)).toEqual(new Uint8Array([1, 2, 3, 4, 5, 6]))
    })

    it('handles empty arrays', () => {
      expect(concatBytes(new Uint8Array(0), new Uint8Array([1]))).toEqual(
        new Uint8Array([1])
      )
    })
  })
})
