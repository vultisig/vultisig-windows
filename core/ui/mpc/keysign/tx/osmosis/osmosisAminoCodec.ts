import { fromBase64 } from '@cosmjs/encoding'
import { GeneratedType } from '@cosmjs/proto-signing'
import { BinaryWriter } from 'cosmjs-types/binary'
import { z } from 'zod'

/**
 * One field of a hand-written Osmosis message, keyed by its amino JSON name.
 * `legacyDec` is a `LegacyDec` without the `cosmos.Dec` scalar: since Osmosis
 * v26 the chain signs and stores it as the same 18-decimal atomics string.
 */
export type OsmosisProtoField =
  | {
      key: string
      fieldNo: number
      kind:
        | 'string'
        | 'legacyDec'
        | 'uint64'
        | 'int64'
        | 'bytes'
        | 'packedUint64'
    }
  | {
      key: string
      fieldNo: number
      kind: 'message' | 'repeatedMessage'
      fields: OsmosisProtoField[]
    }

const varintWireType = 0
const lengthDelimitedWireType = 2

const maxUint64 = 2n ** 64n - 1n
const minInt64 = -(2n ** 63n)
const maxInt64 = 2n ** 63n - 1n

const aminoRecordSchema = z.record(z.string(), z.unknown())
const legacyDecSchema = z.string().regex(/^\d+$/)
const uint64Schema = z
  .string()
  .regex(/^\d+$/)
  .transform(BigInt)
  .refine(value => value <= maxUint64)
const int64Schema = z
  .string()
  .regex(/^-?\d+$/)
  .transform(BigInt)
  .refine(value => value >= minInt64 && value <= maxInt64)

type GetFieldTagInput = {
  fieldNo: number
  wireType: number
}

const getFieldTag = ({ fieldNo, wireType }: GetFieldTagInput) =>
  (fieldNo << 3) | wireType

type EncodeFieldsInput = {
  value: unknown
  fields: OsmosisProtoField[]
  writer: BinaryWriter
}

type EncodeFieldInput = {
  field: OsmosisProtoField
  value: unknown
  writer: BinaryWriter
}

const encodeField = ({ field, value, writer }: EncodeFieldInput) => {
  const { fieldNo } = field
  const lengthDelimitedTag = getFieldTag({
    fieldNo,
    wireType: lengthDelimitedWireType,
  })
  const varintTag = getFieldTag({ fieldNo, wireType: varintWireType })

  // A packed repeated field is written even when empty, matching the frontend.
  if (field.kind === 'packedUint64') {
    const items = z.array(uint64Schema).parse(value ?? [])
    writer.uint32(lengthDelimitedTag).fork()
    items.forEach(item => writer.uint64(item))
    writer.ldelim()
    return
  }

  if (value === undefined || value === null) return

  switch (field.kind) {
    case 'string': {
      const text = z.string().parse(value)
      if (text !== '') writer.uint32(lengthDelimitedTag).string(text)
      return
    }
    case 'legacyDec':
      writer.uint32(lengthDelimitedTag).string(legacyDecSchema.parse(value))
      return
    case 'uint64': {
      const number = uint64Schema.parse(value)
      if (number !== 0n) writer.uint32(varintTag).uint64(number)
      return
    }
    case 'int64': {
      const number = int64Schema.parse(value)
      if (number !== 0n) writer.uint32(varintTag).int64(number)
      return
    }
    case 'bytes': {
      const bytes = fromBase64(z.string().parse(value))
      if (bytes.length > 0) writer.uint32(lengthDelimitedTag).bytes(bytes)
      return
    }
    case 'message':
      writer.uint32(lengthDelimitedTag).fork()
      encodeFields({ value, fields: field.fields, writer })
      writer.ldelim()
      return
    case 'repeatedMessage':
      z.array(z.unknown())
        .parse(value)
        .forEach(item => {
          writer.uint32(lengthDelimitedTag).fork()
          encodeFields({ value: item, fields: field.fields, writer })
          writer.ldelim()
        })
  }
}

const encodeFields = ({ value, fields, writer }: EncodeFieldsInput) => {
  const record = aminoRecordSchema.parse(value)

  // An unknown field would be dropped from the bytes and yield a hash that
  // never lands on-chain, so refuse it and let the caller track no hash at all.
  const knownKeys = new Set(fields.map(({ key }) => key))
  const unknownKey = Object.keys(record).find(key => !knownKeys.has(key))
  if (unknownKey !== undefined) {
    throw new Error(`Unknown Osmosis amino field: ${unknownKey}`)
  }

  fields.forEach(field => {
    encodeField({ field, value: record[field.key], writer })
  })
}

/**
 * Builds an encode-only protobuf type whose message is the amino JSON value.
 * Throws on a field or value it cannot encode exactly, because a best-effort
 * encoding would produce a hash that never lands on-chain.
 */
export const createOsmosisProtoType = (
  fields: OsmosisProtoField[]
): GeneratedType => ({
  encode: (value: unknown, writer = BinaryWriter.create()) => {
    encodeFields({ value, fields, writer })
    return writer
  },
  decode: () => {
    throw new Error('Osmosis amino message types are encode-only')
  },
  fromPartial: (value: unknown) => value,
})
