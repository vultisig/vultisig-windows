import { Address, beginCell, Cell } from '@ton/core'
import { sha256_sync } from '@ton/crypto'

const signDataPrefix = 'ton-connect/sign-data/'

/** Standard CRC32-IEEE lookup table for TL-B schema hashing. */
const crc32Table = (() => {
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    table[i] = c
  }
  return table
})()

/** Computes CRC32-IEEE checksum of a buffer. */
const crc32 = (data: Buffer): number => {
  let crc = 0xffffffff
  for (const byte of data) {
    crc = (crc32Table[(crc ^ byte) & 0xff] ?? 0) ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

/**
 * Encodes a domain in TON DNS wire format per TEP-81 (reverse order, null-separated).
 * Example: "stonfi.com" -> "com\0stonfi\0"
 */
export const encodeDnsDomain = (domain: string): string =>
  domain
    .split('.')
    .reverse()
    .map(part => part + '\0')
    .join('')

type BuildSignDataTextBinaryHashInput = {
  address: string
  domain: string
  timestamp: number
  type: 'text' | 'binary'
  payloadData: Buffer
}

/**
 * Builds the SHA-256 hash for signing text or binary payloads per the TonConnect v2 signData spec.
 *
 * Layout: 0xffff ++ "ton-connect/sign-data/" ++ Address ++ AppDomain ++ Timestamp ++ Payload
 * Where Payload = typePrefix ("txt"|"bin") ++ payloadLength (uint32 BE) ++ payloadData
 */
export const buildSignDataTextBinaryHash = ({
  address,
  domain,
  timestamp,
  type,
  payloadData,
}: BuildSignDataTextBinaryHashInput): string => {
  const parsedAddress = Address.parse(address)

  const workchainBuf = Buffer.alloc(4)
  workchainBuf.writeInt32BE(parsedAddress.workChain, 0)

  const domainBytes = Buffer.from(domain, 'utf-8')
  const domainLengthBuf = Buffer.alloc(4)
  domainLengthBuf.writeUInt32BE(domainBytes.length, 0)

  const timestampBuf = Buffer.alloc(8)
  timestampBuf.writeBigUInt64BE(BigInt(timestamp), 0)

  const typePrefix = Buffer.from(type === 'text' ? 'txt' : 'bin', 'utf-8')

  const payloadLengthBuf = Buffer.alloc(4)
  payloadLengthBuf.writeUInt32BE(payloadData.length, 0)

  const message = Buffer.concat([
    Buffer.from([0xff, 0xff]),
    Buffer.from(signDataPrefix, 'utf-8'),
    workchainBuf,
    parsedAddress.hash,
    domainLengthBuf,
    domainBytes,
    timestampBuf,
    typePrefix,
    payloadLengthBuf,
    payloadData,
  ])

  return sha256_sync(message).toString('hex')
}

type BuildSignDataCellHashInput = {
  address: string
  domain: string
  timestamp: number
  schema: string
  cellBase64: string
}

/**
 * Builds the cell hash for signing cell payloads per the TonConnect v2 signData spec.
 *
 * TL-B: message#75569022 schema_hash:uint32 timestamp:uint64 userAddress:MsgAddress
 *         {n:#} appDomain:^(SnakeData ~n) payload:^Cell = Message;
 */
export const buildSignDataCellHash = ({
  address,
  domain,
  timestamp,
  schema,
  cellBase64,
}: BuildSignDataCellHashInput): string => {
  const parsedAddress = Address.parse(address)
  const schemaHash = crc32(Buffer.from(schema, 'utf-8'))
  const dnsDomain = encodeDnsDomain(domain)

  const cells = Cell.fromBoc(Buffer.from(cellBase64, 'base64'))
  if (cells.length !== 1) {
    throw new Error('Invalid cell: expected exactly one root cell')
  }
  const [payloadCell] = cells

  const messageCell = beginCell()
    .storeUint(0x75569022, 32)
    .storeUint(schemaHash, 32)
    .storeUint(timestamp, 64)
    .storeAddress(parsedAddress)
    .storeStringRefTail(dnsDomain)
    .storeRef(payloadCell)
    .endCell()

  return messageCell.hash().toString('hex')
}
