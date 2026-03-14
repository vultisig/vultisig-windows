import { keccak_256 } from '@noble/hashes/sha3.js'

const base58Alphabet =
  '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

const fullBlockSize = 8
const fullEncodedBlockSize = 11
const encodedBlockSizes = [0, 2, 3, 5, 6, 7, 9, 10, 11] as const
const decodedBlockSizes = Object.fromEntries(
  encodedBlockSizes.map((size, index) => [size, index])
) as Record<number, number>

const moneroAddressMeta = {
  18: { network: 'mainnet', type: 'standard', payloadLength: 65 },
  19: { network: 'mainnet', type: 'integrated', payloadLength: 73 },
  24: { network: 'stagenet', type: 'standard', payloadLength: 65 },
  25: { network: 'stagenet', type: 'integrated', payloadLength: 73 },
  36: { network: 'stagenet', type: 'subaddress', payloadLength: 65 },
  42: { network: 'mainnet', type: 'subaddress', payloadLength: 65 },
  53: { network: 'testnet', type: 'standard', payloadLength: 65 },
  54: { network: 'testnet', type: 'integrated', payloadLength: 73 },
  63: { network: 'testnet', type: 'subaddress', payloadLength: 65 },
} as const

export type MoneroAddressInfo = {
  network: 'mainnet' | 'stagenet' | 'testnet'
  type: 'standard' | 'subaddress' | 'integrated'
}

const decodeMoneroBase58Block = (
  block: string,
  decodedSize: number
): Uint8Array | null => {
  let value = BigInt(0)

  for (const char of block) {
    const index = base58Alphabet.indexOf(char)
    if (index === -1) return null
    value = value * 58n + BigInt(index)
  }

  const maxValue = 1n << BigInt(decodedSize * 8)
  if (value >= maxValue) return null

  const decoded = new Uint8Array(decodedSize)
  for (let i = decodedSize - 1; i >= 0; i--) {
    decoded[i] = Number(value & 0xffn)
    value >>= 8n
  }

  return decoded
}

const decodeMoneroBase58 = (address: string): Uint8Array | null => {
  if (!address) return null

  const fullBlocks = Math.floor(address.length / fullEncodedBlockSize)
  const remainder = address.length % fullEncodedBlockSize
  const remainderSize = decodedBlockSizes[remainder]

  if (remainder !== 0 && remainderSize === undefined) {
    return null
  }

  const totalSize =
    fullBlocks * fullBlockSize + (remainder > 0 ? remainderSize : 0)
  const decoded = new Uint8Array(totalSize)

  let offset = 0
  for (let i = 0; i < fullBlocks; i++) {
    const chunk = address.slice(
      i * fullEncodedBlockSize,
      (i + 1) * fullEncodedBlockSize
    )
    const block = decodeMoneroBase58Block(chunk, fullBlockSize)
    if (!block) return null
    decoded.set(block, offset)
    offset += fullBlockSize
  }

  if (remainder > 0) {
    const block = decodeMoneroBase58Block(
      address.slice(fullBlocks * fullEncodedBlockSize),
      remainderSize
    )
    if (!block) return null
    decoded.set(block, offset)
  }

  return decoded
}

export const parseMoneroAddress = (
  address: string
): MoneroAddressInfo | null => {
  const trimmed = address.trim()
  const decoded = decodeMoneroBase58(trimmed)
  if (!decoded || decoded.length < 5) return null

  const prefix = decoded[0]
  const meta = moneroAddressMeta[prefix as keyof typeof moneroAddressMeta]
  if (!meta) return null

  const payload = decoded.slice(0, -4)
  if (payload.length !== meta.payloadLength) return null

  const checksum = decoded.slice(-4)
  const expectedChecksum = keccak_256(payload).slice(0, 4)
  if (!checksum.every((byte, index) => byte === expectedChecksum[index])) {
    return null
  }

  return { network: meta.network, type: meta.type }
}

export const isMoneroAddress = (address: string): boolean =>
  parseMoneroAddress(address) !== null
