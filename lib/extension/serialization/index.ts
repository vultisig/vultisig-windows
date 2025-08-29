export type Serialized<T = unknown> = string & { __serializedType?: T }

type TaggedValue = { __s: 'bigint'; v: string } | { __s: 'u8a'; v: string }

const bigintTag = 'bigint' as const
const uint8ArrayTag = 'u8a' as const

const uint8ToBase64 = (bytes: Uint8Array): string => {
  return Buffer.from(bytes).toString('base64')
}

const base64ToUint8 = (base64: string): Uint8Array => {
  return new Uint8Array(Buffer.from(base64, 'base64'))
}

const replacer = (_key: string, value: unknown): unknown => {
  if (typeof value === 'bigint') {
    const tagged: TaggedValue = { __s: bigintTag, v: value.toString() }
    return tagged
  }

  if (value instanceof Uint8Array) {
    const tagged: TaggedValue = { __s: uint8ArrayTag, v: uint8ToBase64(value) }
    return tagged
  }

  return value
}

const reviver = (_key: string, value: unknown): unknown => {
  if (
    value !== null &&
    typeof value === 'object' &&
    '__s' in (value as Record<string, unknown>) &&
    'v' in (value as Record<string, unknown>)
  ) {
    const tagged = value as TaggedValue
    if (tagged.__s === bigintTag) {
      return BigInt(tagged.v)
    }
    if (tagged.__s === uint8ArrayTag) {
      return base64ToUint8(tagged.v)
    }
  }
  return value
}

export const serialize = <T>(value: T): Serialized<T> =>
  JSON.stringify(value, replacer) as Serialized<T>

export const deserialize = <T>(value: Serialized<T>): T =>
  JSON.parse(value as string, reviver) as T
