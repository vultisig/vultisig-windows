import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { attempt } from '@vultisig/lib-utils/attempt'
import {
  decodeRlp,
  getAddress,
  getBytes,
  RlpStructuredData,
  toBigInt,
} from 'ethers'

/**
 * The parts of an EVM transaction that say what signing its preimage would
 * authorize.
 */
export type EvmTxPreimage = {
  /** `null` for a pre-EIP-155 legacy preimage, which names no chain. */
  chainId: bigint | null
  /** Checksummed recipient, `null` for a contract creation. */
  to: string | null
  /** Native amount, in wei. */
  value: bigint
  /** Calldata, `0x` for a plain transfer. */
  data: string
}

type TxField =
  | 'chainId'
  | 'nonce'
  | 'gasPrice'
  | 'maxPriorityFeePerGas'
  | 'maxFeePerGas'
  | 'gasLimit'
  | 'to'
  | 'value'
  | 'data'
  | 'accessList'
  | 'r'
  | 's'

type TxFields = Partial<Record<TxField, string>>

// Typed envelopes are the type byte followed by an RLP list of exactly these
// fields. A signed envelope appends yParity, r and s, and is not a preimage.
const typedTxFields = new Map<number, readonly TxField[]>([
  [
    0x01,
    [
      'chainId',
      'nonce',
      'gasPrice',
      'gasLimit',
      'to',
      'value',
      'data',
      'accessList',
    ],
  ],
  [
    0x02,
    [
      'chainId',
      'nonce',
      'maxPriorityFeePerGas',
      'maxFeePerGas',
      'gasLimit',
      'to',
      'value',
      'data',
      'accessList',
    ],
  ],
])

const legacyTxFields: readonly TxField[] = [
  'nonce',
  'gasPrice',
  'gasLimit',
  'to',
  'value',
  'data',
]

// EIP-155 puts the chain id where a signed transaction keeps v, and leaves the
// r and s slots empty.
const eip155LegacyTxFields: readonly TxField[] = [
  ...legacyTxFields,
  'chainId',
  'r',
  's',
]

const addressByteLength = 20

const decodeRlpList = (bytes: Uint8Array): RlpStructuredData[] | null => {
  const result = attempt(() => decodeRlp(bytes))

  if ('error' in result || !Array.isArray(result.data)) return null

  return result.data
}

type ReadTxFieldsInput = {
  items: RlpStructuredData[]
  fields: readonly TxField[]
}

// Only the access list is a list; every other field is a byte string.
const readTxFields = ({
  items,
  fields,
}: ReadTxFieldsInput): TxFields | null => {
  if (items.length !== fields.length) return null

  const result: TxFields = {}

  for (const [index, field] of fields.entries()) {
    const item = items[index]

    if (Array.isArray(item) !== (field === 'accessList')) return null

    if (typeof item === 'string') {
      result[field] = item
    }
  }

  return result
}

const readEvmTxFields = (bytes: Uint8Array): TxFields | null => {
  const typedFields = typedTxFields.get(bytes[0])

  if (typedFields) {
    const items = decodeRlpList(bytes.subarray(1))

    return items && readTxFields({ items, fields: typedFields })
  }

  const items = decodeRlpList(bytes)

  if (!items) return null

  const eip155Fields = readTxFields({ items, fields: eip155LegacyTxFields })

  if (eip155Fields) {
    return eip155Fields.r === '0x' && eip155Fields.s === '0x'
      ? eip155Fields
      : null
  }

  return readTxFields({ items, fields: legacyTxFields })
}

const toInteger = (value: string) => toBigInt(getBytes(value))

/**
 * Reads bytes as an EVM transaction signing preimage: a legacy EIP-155
 * `rlp([nonce, gasPrice, gas, to, value, data, chainId, 0, 0])`, its pre-155
 * six-field form, or an EIP-2930 (`0x01`) or EIP-1559 (`0x02`) envelope.
 * Returns `null` for anything else, including a transaction that is already
 * signed. The bytes must be exactly one RLP list with the format's field
 * count and a `to` that is empty or 20 bytes.
 */
export const parseEvmTxPreimage = (bytes: Uint8Array): EvmTxPreimage | null => {
  if (bytes.length === 0) return null

  const fields = readEvmTxFields(bytes)

  if (!fields) return null

  const { chainId } = fields
  const to = shouldBePresent(fields.to, 'to')
  const toLength = getBytes(to).length

  if (toLength !== 0 && toLength !== addressByteLength) return null

  return {
    chainId: chainId === undefined ? null : toInteger(chainId),
    to: toLength === 0 ? null : getAddress(to),
    value: toInteger(shouldBePresent(fields.value, 'value')),
    data: shouldBePresent(fields.data, 'data'),
  }
}
