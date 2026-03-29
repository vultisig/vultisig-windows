import { Address } from '@ton/core'
import { sha256_sync } from '@ton/crypto'
import { describe, expect, it } from 'vitest'

import {
  buildTonProofPayload,
  formatTonProofReply,
  getTonProofHash,
} from '@clients/extension/src/inpage/providers/tonConnect/tonProof'

const testAddress =
  '0:8a8627861a5dd96c9db3ce0807b122da5ed473934ce7568a5b4b1c361cbb28ae'
const testDomain = 'example.com'
const testTimestamp = 1700000000
const testPayload = 'test-nonce-12345'

describe('buildTonProofPayload', () => {
  it('should produce a buffer with the correct layout and length', () => {
    const result = buildTonProofPayload({
      address: testAddress,
      domain: testDomain,
      timestamp: testTimestamp,
      payload: testPayload,
    })

    const parsedAddress = Address.parse(testAddress)
    const domainBytes = Buffer.from(testDomain, 'utf-8')
    const payloadBytes = Buffer.from(testPayload, 'utf-8')

    const expectedLength =
      18 + // "ton-proof-item-v2/"
      4 + // workchain uint32 BE
      32 + // address hash
      4 + // domain length uint32 LE
      domainBytes.length +
      8 + // timestamp uint64 LE
      payloadBytes.length

    expect(result.length).toBe(expectedLength)

    let offset = 0

    expect(result.subarray(offset, offset + 18).toString('utf-8')).toBe(
      'ton-proof-item-v2/'
    )
    offset += 18

    const workchainBuf = Buffer.alloc(4)
    workchainBuf.writeInt32BE(parsedAddress.workChain, 0)
    expect(result.subarray(offset, offset + 4)).toEqual(workchainBuf)
    offset += 4

    expect(result.subarray(offset, offset + 32)).toEqual(parsedAddress.hash)
    offset += 32

    const domainLenBuf = Buffer.alloc(4)
    domainLenBuf.writeUInt32LE(domainBytes.length, 0)
    expect(result.subarray(offset, offset + 4)).toEqual(domainLenBuf)
    offset += 4

    expect(result.subarray(offset, offset + domainBytes.length)).toEqual(
      domainBytes
    )
    offset += domainBytes.length

    const timestampBuf = Buffer.alloc(8)
    timestampBuf.writeBigUInt64LE(BigInt(testTimestamp), 0)
    expect(result.subarray(offset, offset + 8)).toEqual(timestampBuf)
    offset += 8

    expect(result.subarray(offset)).toEqual(payloadBytes)
  })

  it('should encode workchain 0 as four zero bytes', () => {
    const result = buildTonProofPayload({
      address: testAddress,
      domain: testDomain,
      timestamp: testTimestamp,
      payload: testPayload,
    })

    const workchainBytes = result.subarray(18, 22)
    expect(workchainBytes).toEqual(Buffer.from([0, 0, 0, 0]))
  })

  it('should handle unicode domain names', () => {
    const unicodeDomain = 'example.xn--e1afmapc'
    const result = buildTonProofPayload({
      address: testAddress,
      domain: unicodeDomain,
      timestamp: testTimestamp,
      payload: testPayload,
    })

    const domainBytes = Buffer.from(unicodeDomain, 'utf-8')
    const domainLenSlice = result.subarray(54, 58)
    const domainLenBuf = Buffer.alloc(4)
    domainLenBuf.writeUInt32LE(domainBytes.length, 0)
    expect(domainLenSlice).toEqual(domainLenBuf)
  })

  it('should handle empty payload', () => {
    const result = buildTonProofPayload({
      address: testAddress,
      domain: testDomain,
      timestamp: testTimestamp,
      payload: '',
    })

    const domainBytes = Buffer.from(testDomain, 'utf-8')
    const expectedLength = 18 + 4 + 32 + 4 + domainBytes.length + 8
    expect(result.length).toBe(expectedLength)
  })
})

describe('getTonProofHash', () => {
  it('should return a 64-character hex string', () => {
    const message = buildTonProofPayload({
      address: testAddress,
      domain: testDomain,
      timestamp: testTimestamp,
      payload: testPayload,
    })

    const hash = getTonProofHash(message)
    expect(hash).toHaveLength(64)
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })

  it('should match manual double-SHA256 computation', () => {
    const message = buildTonProofPayload({
      address: testAddress,
      domain: testDomain,
      timestamp: testTimestamp,
      payload: testPayload,
    })

    const msgHash = sha256_sync(message)
    const fullMsg = Buffer.concat([
      Buffer.from([0xff, 0xff]),
      Buffer.from('ton-connect', 'utf-8'),
      msgHash,
    ])
    const expected = sha256_sync(fullMsg).toString('hex')

    expect(getTonProofHash(message)).toBe(expected)
  })

  it('should produce different hashes for different payloads', () => {
    const message1 = buildTonProofPayload({
      address: testAddress,
      domain: testDomain,
      timestamp: testTimestamp,
      payload: 'payload-1',
    })
    const message2 = buildTonProofPayload({
      address: testAddress,
      domain: testDomain,
      timestamp: testTimestamp,
      payload: 'payload-2',
    })

    expect(getTonProofHash(message1)).not.toBe(getTonProofHash(message2))
  })

  it('should produce different hashes for different timestamps', () => {
    const message1 = buildTonProofPayload({
      address: testAddress,
      domain: testDomain,
      timestamp: 1700000000,
      payload: testPayload,
    })
    const message2 = buildTonProofPayload({
      address: testAddress,
      domain: testDomain,
      timestamp: 1700000001,
      payload: testPayload,
    })

    expect(getTonProofHash(message1)).not.toBe(getTonProofHash(message2))
  })

  it('should produce different hashes for different domains', () => {
    const message1 = buildTonProofPayload({
      address: testAddress,
      domain: 'example.com',
      timestamp: testTimestamp,
      payload: testPayload,
    })
    const message2 = buildTonProofPayload({
      address: testAddress,
      domain: 'other.com',
      timestamp: testTimestamp,
      payload: testPayload,
    })

    expect(getTonProofHash(message1)).not.toBe(getTonProofHash(message2))
  })
})

describe('formatTonProofReply', () => {
  it('should format the reply with base64-encoded signature', () => {
    const signatureHex = 'a'.repeat(128)
    const result = formatTonProofReply({
      signatureHex,
      timestamp: testTimestamp,
      domain: testDomain,
      payload: testPayload,
    })

    expect(result.name).toBe('ton_proof')
    expect(result.proof.timestamp).toBe(testTimestamp)
    expect(result.proof.domain.value).toBe(testDomain)
    expect(result.proof.domain.lengthBytes).toBe(
      Buffer.from(testDomain, 'utf-8').length
    )
    expect(result.proof.payload).toBe(testPayload)

    const expectedBase64 = Buffer.from(signatureHex, 'hex').toString('base64')
    expect(result.proof.signature).toBe(expectedBase64)
  })

  it('should correctly compute domain lengthBytes for ASCII domains', () => {
    const result = formatTonProofReply({
      signatureHex: 'ab'.repeat(64),
      timestamp: testTimestamp,
      domain: 'test.com',
      payload: testPayload,
    })

    expect(result.proof.domain.lengthBytes).toBe(8)
  })

  it('should preserve the original payload in the reply', () => {
    const originalPayload = 'some-random-nonce-value'
    const result = formatTonProofReply({
      signatureHex: 'ab'.repeat(64),
      timestamp: testTimestamp,
      domain: testDomain,
      payload: originalPayload,
    })

    expect(result.proof.payload).toBe(originalPayload)
  })
})
