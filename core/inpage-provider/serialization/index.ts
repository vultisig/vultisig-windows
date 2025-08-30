import Long from 'long'

export type Serialized<T = unknown> = string & { __serializedType?: T }

type TaggedValue =
  | { __s: 'bigint'; v: string }
  | { __s: 'u8a'; v: string }
  | { __s: 'long'; v: string; u?: boolean }

const bigintTag = 'bigint' as const
const uint8ArrayTag = 'u8a' as const
const longTag = 'long' as const

const uint8ToBase64 = (bytes: Uint8Array): string => {
  return Buffer.from(bytes).toString('base64')
}

const base64ToUint8 = (base64: string): Uint8Array => {
  return new Uint8Array(Buffer.from(base64, 'base64'))
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object'

const replacer = (_key: string, value: unknown): unknown => {
  if (typeof value === 'bigint') {
    const tagged: TaggedValue = { __s: bigintTag, v: value.toString() }
    return tagged
  }

  if (value instanceof Uint8Array) {
    const tagged: TaggedValue = { __s: uint8ArrayTag, v: uint8ToBase64(value) }
    return tagged
  }

  if (Long.isLong(value as any)) {
    const l = value as Long
    const tagged: TaggedValue = {
      __s: longTag,
      v: l.toString(),
      u: l.unsigned || undefined,
    }
    return tagged
  }

  return value
}

const reviver = (_key: string, value: unknown): unknown => {
  if (isObject(value) && '__s' in value && 'v' in value) {
    const tagged = value as TaggedValue
    if (tagged.__s === bigintTag) {
      return BigInt(tagged.v)
    }
    if (tagged.__s === uint8ArrayTag) {
      return base64ToUint8(tagged.v)
    }
    if (tagged.__s === longTag) {
      return Long.fromString(tagged.v, (tagged as any).u === true)
    }
  }
  return value
}

export const serialize = <T>(value: T): Serialized<T> =>
  JSON.stringify(value, replacer) as Serialized<T>

export const deserialize = <T>(value: Serialized<T>): T =>
  JSON.parse(value as string, reviver) as T
