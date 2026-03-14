import { keccak_256 } from '@noble/hashes/sha3.js'
import { describe, expect, it } from 'vitest'

import { parseMoneroAddress } from './isMoneroAddress'

const base58Alphabet =
  '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

const fullBlockSize = 8
const encodedBlockSizes = [0, 2, 3, 5, 6, 7, 9, 10, 11] as const

const encodeMoneroBase58Block = (
  bytes: Uint8Array,
  encodedSize: number
): string => {
  let value = 0n
  for (const byte of bytes) {
    value = (value << 8n) | BigInt(byte)
  }

  let result = ''
  while (value > 0n) {
    result = base58Alphabet[Number(value % 58n)] + result
    value /= 58n
  }

  return result.padStart(encodedSize, '1')
}

const encodeMoneroBase58 = (bytes: Uint8Array): string => {
  const chunks: string[] = []

  for (let offset = 0; offset < bytes.length; offset += fullBlockSize) {
    const block = bytes.slice(offset, offset + fullBlockSize)
    chunks.push(encodeMoneroBase58Block(block, encodedBlockSizes[block.length]))
  }

  return chunks.join('')
}

const createAddress = (prefix: number, payloadLength: number): string => {
  const payload = new Uint8Array(payloadLength)
  payload[0] = prefix
  for (let i = 1; i < payloadLength; i++) {
    payload[i] = (i * 17) % 256
  }

  const checksum = keccak_256(payload).slice(0, 4)
  const encoded = new Uint8Array(payload.length + checksum.length)
  encoded.set(payload)
  encoded.set(checksum, payload.length)

  return encodeMoneroBase58(encoded)
}

describe('parseMoneroAddress', () => {
  it('accepts standard, integrated, and subaddress formats', () => {
    expect(parseMoneroAddress(createAddress(18, 65))).toEqual({
      network: 'mainnet',
      type: 'standard',
    })
    expect(parseMoneroAddress(createAddress(19, 73))).toEqual({
      network: 'mainnet',
      type: 'integrated',
    })
    expect(parseMoneroAddress(createAddress(42, 65))).toEqual({
      network: 'mainnet',
      type: 'subaddress',
    })
  })

  it('rejects bad checksum, unknown prefixes, and invalid characters', () => {
    const valid = createAddress(18, 65)
    const wrongChecksum = valid.slice(0, -1) + (valid.endsWith('1') ? '2' : '1')

    expect(parseMoneroAddress(wrongChecksum)).toBeNull()
    expect(parseMoneroAddress(createAddress(99, 65))).toBeNull()
    expect(parseMoneroAddress(valid.slice(0, -1) + '0')).toBeNull()
  })
})
