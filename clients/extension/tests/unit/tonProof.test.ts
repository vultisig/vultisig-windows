import { describe, expect, it } from 'vitest'

import { formatTonProofReply } from '@clients/extension/src/inpage/providers/tonConnect/tonProof'

const testDomain = 'example.com'
const testTimestamp = 1700000000
const testPayload = 'test-nonce-12345'

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
