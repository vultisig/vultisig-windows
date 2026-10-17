import {
  arrayTypePattern,
  bytesTypePattern,
} from '@core/inpage-provider/popup/eip712'
import { Eip712V4Payload } from '@core/inpage-provider/popup/interface'
import { TypedDataField } from 'ethers'

import { toBigInt } from './toBigInt'

/** A struct or array field, with its fields or items nested below it. */
export type TypedDataFieldGroup = {
  typeName?: string
  children: TypedDataFieldNode[]
}

/**
 * One EIP-712 message field laid out for review: plain text, an address or
 * hex value (shown truncated with a copy control), or a struct/array group.
 */
export type TypedDataFieldNode =
  | { kind: 'text'; label: string; value: string }
  | { kind: 'hex'; label: string; value: string }
  | { kind: 'group'; label: string; value: TypedDataFieldGroup }

// Deeper values collapse into JSON text. Real payloads stay far shallower;
// the cap keeps a hostile one from nesting the popup into a crash.
const maxDepth = 8

const intTypePattern = /^u?int\d*$/

// Without type information, only address-length (or longer) hex strings
// count as hex, so short values like "0x1" stay plain text.
const untypedHexPattern = /^0x[0-9a-fA-F]{40,}$/

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isTypedDataField = (value: unknown): value is TypedDataField =>
  isRecord(value) &&
  typeof value.name === 'string' &&
  typeof value.type === 'string'

type GetStructFieldsInput = {
  types: unknown
  type: string
}

// Own-property lookup so a type named e.g. `constructor` never resolves to
// an `Object.prototype` member.
const getStructFields = ({
  types,
  type,
}: GetStructFieldsInput): TypedDataField[] | undefined => {
  if (!isRecord(types) || !Object.prototype.hasOwnProperty.call(types, type)) {
    return undefined
  }
  const fields = types[type]
  return Array.isArray(fields) && fields.every(isTypedDataField)
    ? fields
    : undefined
}

const stringifyValue = (value: unknown): string => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    return JSON.stringify(value, (_, item: unknown) =>
      typeof item === 'bigint' ? item.toString() : item
    )
  }
  return String(value)
}

type ToLeafNodeInput = {
  label: string
  type?: string
  value: unknown
}

const toLeafNode = ({
  label,
  type,
  value,
}: ToLeafNodeInput): TypedDataFieldNode => {
  const amount =
    type !== undefined && intTypePattern.test(type)
      ? toBigInt(value)
      : undefined
  if (amount !== undefined) {
    return { kind: 'text', label, value: amount.toString() }
  }

  const text = stringifyValue(value)
  const isHex =
    type === undefined
      ? untypedHexPattern.test(text)
      : type === 'address' || bytesTypePattern.test(type)

  return isHex && typeof value === 'string' && value.length > 0
    ? { kind: 'hex', label, value }
    : { kind: 'text', label, value: text }
}

type ToFieldNodeInput = {
  types: unknown
  label: string
  type?: string
  value: unknown
  depth: number
}

const toFieldNode = ({
  types,
  label,
  type,
  value,
  depth,
}: ToFieldNodeInput): TypedDataFieldNode => {
  if (depth > maxDepth) {
    return { kind: 'text', label, value: stringifyValue(value) }
  }

  const toGroup = (
    children: Omit<ToFieldNodeInput, 'types' | 'depth'>[]
  ): TypedDataFieldNode => ({
    kind: 'group',
    label,
    value: {
      typeName: type,
      children: children.map(child =>
        toFieldNode({ ...child, types, depth: depth + 1 })
      ),
    },
  })

  if (Array.isArray(value)) {
    if (value.length === 0) return { kind: 'text', label, value: '[]' }
    const itemType = type?.match(arrayTypePattern)?.[1]
    return toGroup(
      value.map((item, index) => ({
        label: `#${index + 1}`,
        type: itemType,
        value: item,
      }))
    )
  }

  if (isRecord(value)) {
    const fields =
      type === undefined ? undefined : getStructFields({ types, type })
    const children = fields
      ? fields.map(field => ({
          label: field.name,
          type: field.type,
          value: value[field.name],
        }))
      : Object.entries(value).map(([key, item]) => ({
          label: key,
          value: item,
        }))
    if (children.length === 0) return { kind: 'text', label, value: '{}' }
    return toGroup(children)
  }

  return toLeafNode({ label, type, value })
}

type GetTypedDataFieldNodesInput = Pick<
  Eip712V4Payload,
  'types' | 'message'
> & {
  primaryType: string
}

/**
 * Lays out an EIP-712 message for review, one node per field. With the
 * primary type's definition at hand, fields follow its declared order and
 * keys it does not declare are left out, since the hash never covers them.
 * Values that do not match their declared type, or a primary type the types
 * do not define, fall back to walking the raw value. Pass the signed primary
 * type (`getEip712SignedPrimaryType`), not the declared one. The payload
 * comes from the page, so every value is checked at runtime.
 */
export const getTypedDataFieldNodes = ({
  types,
  message,
  primaryType,
}: GetTypedDataFieldNodesInput): TypedDataFieldNode[] => {
  if (!isRecord(message)) return []

  const root = toFieldNode({
    types,
    label: primaryType,
    type: primaryType,
    value: message,
    depth: 0,
  })

  return root.kind === 'group' ? root.value.children : []
}
