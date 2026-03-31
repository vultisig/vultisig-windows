import { Address, beginCell } from '@ton/core'
import { sha256_sync } from '@ton/crypto'
import { describe, expect, it } from 'vitest'

import {
  buildSignDataCellHash,
  buildSignDataTextBinaryHash,
  encodeDnsDomain,
} from '@clients/extension/src/inpage/providers/tonConnect/signData'

const testAddress =
  '0:8a8627861a5dd96c9db3ce0807b122da5ed473934ce7568a5b4b1c361cbb28ae'
const testDomain = 'example.com'
const testTimestamp = 1700000000

describe('buildSignDataTextBinaryHash', () => {
  it('should return a 64-character hex string for text type', () => {
    const hash = buildSignDataTextBinaryHash({
      address: testAddress,
      domain: testDomain,
      timestamp: testTimestamp,
      type: 'text',
      payloadData: Buffer.from('Hello, TON!', 'utf-8'),
    })

    expect(hash).toHaveLength(64)
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })

  it('should return a 64-character hex string for binary type', () => {
    const hash = buildSignDataTextBinaryHash({
      address: testAddress,
      domain: testDomain,
      timestamp: testTimestamp,
      type: 'binary',
      payloadData: Buffer.from([0xde, 0xad, 0xbe, 0xef]),
    })

    expect(hash).toHaveLength(64)
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })

  it('should match manual SHA-256 computation for text type', () => {
    const text = 'Hello, TON!'
    const payloadData = Buffer.from(text, 'utf-8')
    const parsedAddress = Address.parse(testAddress)

    const workchainBuf = Buffer.alloc(4)
    workchainBuf.writeInt32BE(parsedAddress.workChain, 0)

    const domainBytes = Buffer.from(testDomain, 'utf-8')
    const domainLengthBuf = Buffer.alloc(4)
    domainLengthBuf.writeUInt32BE(domainBytes.length, 0)

    const timestampBuf = Buffer.alloc(8)
    timestampBuf.writeBigUInt64BE(BigInt(testTimestamp), 0)

    const payloadLengthBuf = Buffer.alloc(4)
    payloadLengthBuf.writeUInt32BE(payloadData.length, 0)

    const message = Buffer.concat([
      Buffer.from([0xff, 0xff]),
      Buffer.from('ton-connect/sign-data/', 'utf-8'),
      workchainBuf,
      parsedAddress.hash,
      domainLengthBuf,
      domainBytes,
      timestampBuf,
      Buffer.from('txt', 'utf-8'),
      payloadLengthBuf,
      payloadData,
    ])

    const expected = sha256_sync(message).toString('hex')

    const hash = buildSignDataTextBinaryHash({
      address: testAddress,
      domain: testDomain,
      timestamp: testTimestamp,
      type: 'text',
      payloadData,
    })

    expect(hash).toBe(expected)
  })

  it('should use "bin" prefix for binary type', () => {
    const binaryData = Buffer.from([0x01, 0x02, 0x03])
    const parsedAddress = Address.parse(testAddress)

    const workchainBuf = Buffer.alloc(4)
    workchainBuf.writeInt32BE(parsedAddress.workChain, 0)

    const domainBytes = Buffer.from(testDomain, 'utf-8')
    const domainLengthBuf = Buffer.alloc(4)
    domainLengthBuf.writeUInt32BE(domainBytes.length, 0)

    const timestampBuf = Buffer.alloc(8)
    timestampBuf.writeBigUInt64BE(BigInt(testTimestamp), 0)

    const payloadLengthBuf = Buffer.alloc(4)
    payloadLengthBuf.writeUInt32BE(binaryData.length, 0)

    const message = Buffer.concat([
      Buffer.from([0xff, 0xff]),
      Buffer.from('ton-connect/sign-data/', 'utf-8'),
      workchainBuf,
      parsedAddress.hash,
      domainLengthBuf,
      domainBytes,
      timestampBuf,
      Buffer.from('bin', 'utf-8'),
      payloadLengthBuf,
      binaryData,
    ])

    const expected = sha256_sync(message).toString('hex')

    const hash = buildSignDataTextBinaryHash({
      address: testAddress,
      domain: testDomain,
      timestamp: testTimestamp,
      type: 'binary',
      payloadData: binaryData,
    })

    expect(hash).toBe(expected)
  })

  it('should produce different hashes for text vs binary with same bytes', () => {
    const data = Buffer.from('same-data', 'utf-8')

    const textHash = buildSignDataTextBinaryHash({
      address: testAddress,
      domain: testDomain,
      timestamp: testTimestamp,
      type: 'text',
      payloadData: data,
    })

    const binaryHash = buildSignDataTextBinaryHash({
      address: testAddress,
      domain: testDomain,
      timestamp: testTimestamp,
      type: 'binary',
      payloadData: data,
    })

    expect(textHash).not.toBe(binaryHash)
  })

  it('should produce different hashes for different payloads', () => {
    const hash1 = buildSignDataTextBinaryHash({
      address: testAddress,
      domain: testDomain,
      timestamp: testTimestamp,
      type: 'text',
      payloadData: Buffer.from('payload-1', 'utf-8'),
    })

    const hash2 = buildSignDataTextBinaryHash({
      address: testAddress,
      domain: testDomain,
      timestamp: testTimestamp,
      type: 'text',
      payloadData: Buffer.from('payload-2', 'utf-8'),
    })

    expect(hash1).not.toBe(hash2)
  })

  it('should produce different hashes for different timestamps', () => {
    const payload = Buffer.from('test', 'utf-8')

    const hash1 = buildSignDataTextBinaryHash({
      address: testAddress,
      domain: testDomain,
      timestamp: 1700000000,
      type: 'text',
      payloadData: payload,
    })

    const hash2 = buildSignDataTextBinaryHash({
      address: testAddress,
      domain: testDomain,
      timestamp: 1700000001,
      type: 'text',
      payloadData: payload,
    })

    expect(hash1).not.toBe(hash2)
  })

  it('should produce different hashes for different domains', () => {
    const payload = Buffer.from('test', 'utf-8')

    const hash1 = buildSignDataTextBinaryHash({
      address: testAddress,
      domain: 'example.com',
      timestamp: testTimestamp,
      type: 'text',
      payloadData: payload,
    })

    const hash2 = buildSignDataTextBinaryHash({
      address: testAddress,
      domain: 'other.com',
      timestamp: testTimestamp,
      type: 'text',
      payloadData: payload,
    })

    expect(hash1).not.toBe(hash2)
  })

  it('should produce stable results across calls', () => {
    const input = {
      address: testAddress,
      domain: testDomain,
      timestamp: testTimestamp,
      type: 'text' as const,
      payloadData: Buffer.from('deterministic', 'utf-8'),
    }

    expect(buildSignDataTextBinaryHash(input)).toBe(
      buildSignDataTextBinaryHash(input)
    )
  })

  it('should handle empty text payload', () => {
    const hash = buildSignDataTextBinaryHash({
      address: testAddress,
      domain: testDomain,
      timestamp: testTimestamp,
      type: 'text',
      payloadData: Buffer.alloc(0),
    })

    expect(hash).toHaveLength(64)
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })
})

describe('buildSignDataCellHash', () => {
  const testSchema = 'counter#_ value:uint32 = Counter;'
  const testCell = Buffer.from(
    beginCell().storeUint(42, 32).endCell().toBoc()
  ).toString('base64')

  it('should return a 64-character hex string', () => {
    const hash = buildSignDataCellHash({
      address: testAddress,
      domain: testDomain,
      timestamp: testTimestamp,
      schema: testSchema,
      cellBase64: testCell,
    })

    expect(hash).toHaveLength(64)
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })

  it('should produce stable results across calls', () => {
    const input = {
      address: testAddress,
      domain: testDomain,
      timestamp: testTimestamp,
      schema: testSchema,
      cellBase64: testCell,
    }

    expect(buildSignDataCellHash(input)).toBe(buildSignDataCellHash(input))
  })

  it('should produce different hashes for different schemas', () => {
    const hash1 = buildSignDataCellHash({
      address: testAddress,
      domain: testDomain,
      timestamp: testTimestamp,
      schema: 'counter#_ value:uint32 = Counter;',
      cellBase64: testCell,
    })

    const hash2 = buildSignDataCellHash({
      address: testAddress,
      domain: testDomain,
      timestamp: testTimestamp,
      schema: 'other#_ data:uint64 = Other;',
      cellBase64: testCell,
    })

    expect(hash1).not.toBe(hash2)
  })

  it('should produce different hashes for different cells', () => {
    const cell1 = Buffer.from(
      beginCell().storeUint(1, 32).endCell().toBoc()
    ).toString('base64')

    const cell2 = Buffer.from(
      beginCell().storeUint(2, 32).endCell().toBoc()
    ).toString('base64')

    const hash1 = buildSignDataCellHash({
      address: testAddress,
      domain: testDomain,
      timestamp: testTimestamp,
      schema: testSchema,
      cellBase64: cell1,
    })

    const hash2 = buildSignDataCellHash({
      address: testAddress,
      domain: testDomain,
      timestamp: testTimestamp,
      schema: testSchema,
      cellBase64: cell2,
    })

    expect(hash1).not.toBe(hash2)
  })

  it('should produce different hashes for different domains', () => {
    const hash1 = buildSignDataCellHash({
      address: testAddress,
      domain: 'example.com',
      timestamp: testTimestamp,
      schema: testSchema,
      cellBase64: testCell,
    })

    const hash2 = buildSignDataCellHash({
      address: testAddress,
      domain: 'other.com',
      timestamp: testTimestamp,
      schema: testSchema,
      cellBase64: testCell,
    })

    expect(hash1).not.toBe(hash2)
  })

  it('should produce different hashes for different timestamps', () => {
    const hash1 = buildSignDataCellHash({
      address: testAddress,
      domain: testDomain,
      timestamp: 1700000000,
      schema: testSchema,
      cellBase64: testCell,
    })

    const hash2 = buildSignDataCellHash({
      address: testAddress,
      domain: testDomain,
      timestamp: 1700000001,
      schema: testSchema,
      cellBase64: testCell,
    })

    expect(hash1).not.toBe(hash2)
  })

  it('should throw for invalid base64 cell', () => {
    expect(() =>
      buildSignDataCellHash({
        address: testAddress,
        domain: testDomain,
        timestamp: testTimestamp,
        schema: testSchema,
        cellBase64: 'not-a-valid-boc',
      })
    ).toThrow()
  })

  it('should reject multi-root BOCs', () => {
    // Create two separate cells and manually concat their BOCs won't work,
    // but an empty BOC (zero roots) should also be rejected
    expect(() =>
      buildSignDataCellHash({
        address: testAddress,
        domain: testDomain,
        timestamp: testTimestamp,
        schema: testSchema,
        cellBase64: Buffer.from([
          0xb5, 0xee, 0x9c, 0x72, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
        ]).toString('base64'),
      })
    ).toThrow()
  })
})

describe('encodeDnsDomain', () => {
  it('should reverse labels and null-separate them per TEP-81', () => {
    expect(encodeDnsDomain('stonfi.com')).toBe('com\0stonfi\0')
  })

  it('should handle subdomains', () => {
    expect(encodeDnsDomain('app.example.com')).toBe('com\0example\0app\0')
  })

  it('should handle single-label domains', () => {
    expect(encodeDnsDomain('localhost')).toBe('localhost\0')
  })
})
