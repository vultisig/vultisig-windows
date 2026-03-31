import { Address } from '@ton/core'
import { sha256_sync } from '@ton/crypto'

const tonProofPrefix = 'ton-proof-item-v2/'
const tonConnectPrefix = 'ton-connect'

type BuildTonProofPayloadInput = {
  address: string
  domain: string
  timestamp: number
  payload: string
}

/**
 * Builds the ton-proof-item-v2 message buffer per the TonConnect v2 specification.
 *
 * Layout:
 *   "ton-proof-item-v2/" (18 bytes)
 *   ++ workchain (4 bytes, int32 big-endian)
 *   ++ address hash (32 bytes)
 *   ++ domain length (4 bytes, uint32 little-endian)
 *   ++ domain (UTF-8 bytes)
 *   ++ timestamp (8 bytes, uint64 little-endian)
 *   ++ payload (UTF-8 bytes)
 */
export const buildTonProofPayload = ({
  address,
  domain,
  timestamp,
  payload,
}: BuildTonProofPayloadInput): Buffer => {
  const parsedAddress = Address.parse(address)

  const workchainBuf = Buffer.alloc(4)
  workchainBuf.writeInt32BE(parsedAddress.workChain, 0)

  const domainBytes = Buffer.from(domain, 'utf-8')
  const domainLengthBuf = Buffer.alloc(4)
  domainLengthBuf.writeUInt32LE(domainBytes.length, 0)

  const timestampBuf = Buffer.alloc(8)
  timestampBuf.writeBigUInt64LE(BigInt(timestamp), 0)

  return Buffer.concat([
    Buffer.from(tonProofPrefix, 'utf-8'),
    workchainBuf,
    parsedAddress.hash,
    domainLengthBuf,
    domainBytes,
    timestampBuf,
    Buffer.from(payload, 'utf-8'),
  ])
}

/**
 * Computes the double-SHA256 hash used for ton_proof signing.
 *
 * Returns sha256(0xffff ++ "ton-connect" ++ sha256(message)) as a hex string.
 */
export const getTonProofHash = (message: Buffer): string => {
  const msgHash = sha256_sync(message)

  const fullMsg = Buffer.concat([
    Buffer.from([0xff, 0xff]),
    Buffer.from(tonConnectPrefix, 'utf-8'),
    msgHash,
  ])

  return sha256_sync(fullMsg).toString('hex')
}

type TonProofItemReply = {
  name: 'ton_proof'
  proof: {
    timestamp: number
    domain: {
      lengthBytes: number
      value: string
    }
    payload: string
    signature: string
  }
}

type FormatTonProofReplyInput = {
  signatureHex: string
  timestamp: number
  domain: string
  payload: string
}

/** Formats the TonProofItemReply for the TonConnect connect response. */
export const formatTonProofReply = ({
  signatureHex,
  timestamp,
  domain,
  payload,
}: FormatTonProofReplyInput): TonProofItemReply => ({
  name: 'ton_proof',
  proof: {
    timestamp,
    domain: {
      lengthBytes: Buffer.from(domain, 'utf-8').length,
      value: domain,
    },
    payload,
    signature: Buffer.from(signatureHex, 'hex').toString('base64'),
  },
})
