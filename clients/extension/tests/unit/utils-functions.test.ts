import { describe, expect, it } from 'vitest'

import {
  bytesEqual,
  isVersionedTransaction,
} from '@clients/extension/src/utils/functions'

describe('isVersionedTransaction', () => {
  it('returns true for object with version and message', () => {
    const tx = { version: 0, message: {} }
    expect(isVersionedTransaction(tx)).toBe(true)
  })

  it('returns false for object with only version', () => {
    const tx = { version: 0 }
    expect(isVersionedTransaction(tx)).toBe(false)
  })

  it('returns false for object with only message', () => {
    const tx = { message: {} }
    expect(isVersionedTransaction(tx)).toBe(false)
  })

  it('returns false for empty object', () => {
    const tx = {}
    expect(isVersionedTransaction(tx)).toBe(false)
  })

  it('throws for null (typeof null === "object")', () => {
    // Note: typeof null === 'object' in JavaScript, so the 'in' operator throws
    expect(() => isVersionedTransaction(null)).toThrow(TypeError)
  })

  it('returns false for string', () => {
    expect(isVersionedTransaction('not a transaction')).toBe(false)
  })

  it('returns false for number', () => {
    expect(isVersionedTransaction(42)).toBe(false)
  })

  it('returns true for object with extra properties plus version and message', () => {
    const tx = {
      version: 0,
      message: {},
      signatures: [],
      extra: 'data',
    }
    expect(isVersionedTransaction(tx)).toBe(true)
  })

  it('returns false for undefined', () => {
    expect(isVersionedTransaction(undefined)).toBe(false)
  })

  it('returns false for array', () => {
    expect(isVersionedTransaction(['version', 'message'])).toBe(false)
  })

  it('works with actual numeric version values', () => {
    const legacyTx = { version: 'legacy', message: {} }
    const v0Tx = { version: 0, message: {} }
    expect(isVersionedTransaction(legacyTx)).toBe(true)
    expect(isVersionedTransaction(v0Tx)).toBe(true)
  })
})

describe('bytesEqual', () => {
  it('returns true for same content Uint8Arrays', () => {
    const a = new Uint8Array([1, 2, 3, 4, 5])
    const b = new Uint8Array([1, 2, 3, 4, 5])
    expect(bytesEqual(a, b)).toBe(true)
  })

  it('returns false for different content same length', () => {
    const a = new Uint8Array([1, 2, 3, 4, 5])
    const b = new Uint8Array([1, 2, 3, 4, 6])
    expect(bytesEqual(a, b)).toBe(false)
  })

  it('returns false for different lengths', () => {
    const a = new Uint8Array([1, 2, 3])
    const b = new Uint8Array([1, 2, 3, 4])
    expect(bytesEqual(a, b)).toBe(false)
  })

  it('returns true for both empty', () => {
    const a = new Uint8Array([])
    const b = new Uint8Array([])
    expect(bytesEqual(a, b)).toBe(true)
  })

  it('returns true for same reference', () => {
    const a = new Uint8Array([1, 2, 3])
    expect(bytesEqual(a, a)).toBe(true)
  })

  it('returns true for single element equal', () => {
    const a = new Uint8Array([42])
    const b = new Uint8Array([42])
    expect(bytesEqual(a, b)).toBe(true)
  })

  it('returns false for single element different', () => {
    const a = new Uint8Array([42])
    const b = new Uint8Array([43])
    expect(bytesEqual(a, b)).toBe(false)
  })

  it('handles large arrays', () => {
    const size = 10000
    const a = new Uint8Array(size).fill(255)
    const b = new Uint8Array(size).fill(255)
    expect(bytesEqual(a, b)).toBe(true)
  })

  it('detects difference at the start', () => {
    const a = new Uint8Array([0, 1, 2, 3])
    const b = new Uint8Array([1, 1, 2, 3])
    expect(bytesEqual(a, b)).toBe(false)
  })

  it('detects difference at the end', () => {
    const a = new Uint8Array([1, 2, 3, 4])
    const b = new Uint8Array([1, 2, 3, 5])
    expect(bytesEqual(a, b)).toBe(false)
  })

  it('detects difference in the middle', () => {
    const a = new Uint8Array([1, 2, 3, 4])
    const b = new Uint8Array([1, 2, 9, 4])
    expect(bytesEqual(a, b)).toBe(false)
  })
})
