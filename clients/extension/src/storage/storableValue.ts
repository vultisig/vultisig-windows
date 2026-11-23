import { base64Encode } from '@vultisig/lib-utils/base64Encode'
import { fromBase64 } from '@vultisig/lib-utils/fromBase64'

const markerKey = '__storable'
const markerValueKey = 'value'

// An ordinary record key that could be read as the marker key (`__storable`,
// `~__storable`, …) gains one leading `~` on write and loses it on read, so
// no ordinary record ever looks like a marker.
const escapableKeyPattern = /^~*__storable$/
const escapedKeyPattern = /^~+__storable$/

const isPlainRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const renameKeys = (
  record: Record<string, unknown>,
  rename: (key: string) => string
): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(record).map(([key, value]) => [rename(key), value])
  )

const decodeMarker = (record: Record<string, unknown>): unknown => {
  const keys = Object.keys(record)
  if (
    keys.length !== 2 ||
    !keys.includes(markerKey) ||
    !keys.includes(markerValueKey)
  ) {
    return undefined
  }

  const payload = record[markerValueKey]
  if (typeof payload !== 'string') {
    return undefined
  }

  if (record[markerKey] === 'bigint') {
    return BigInt(payload)
  }

  if (record[markerKey] === 'bytes') {
    return new Uint8Array(fromBase64(payload))
  }

  return undefined
}

/**
 * Turns a value into plain JSON that extension storage keeps intact. Chrome
 * storage can't hold `bigint` and flattens `Uint8Array` into a keyed object,
 * and keysign payloads carry both, so they are written as exact-shape
 * markers here.
 */
export const toStorableValue = (value: unknown): unknown =>
  JSON.parse(
    JSON.stringify(
      value,
      // Reads the raw value from the holder because Buffer's toJSON runs
      // before the replacer sees it.
      function (this: Record<string, unknown>, key: string, value: unknown) {
        const raw = this[key]

        if (typeof raw === 'bigint') {
          return { [markerKey]: 'bigint', [markerValueKey]: raw.toString() }
        }

        if (raw instanceof Uint8Array) {
          return { [markerKey]: 'bytes', [markerValueKey]: base64Encode(raw) }
        }

        if (
          isPlainRecord(value) &&
          Object.keys(value).some(k => escapableKeyPattern.test(k))
        ) {
          return renameKeys(value, k =>
            escapableKeyPattern.test(k) ? `~${k}` : k
          )
        }

        return value
      }
    )
  )

/**
 * Restores a value written by `toStorableValue`. Only exact-shape markers are
 * decoded; every other value passes through unchanged.
 */
export const fromStorableValue = <T>(value: unknown): T =>
  JSON.parse(JSON.stringify(value), (_key, raw: unknown) => {
    if (!isPlainRecord(raw)) {
      return raw
    }

    const decoded = decodeMarker(raw)
    if (decoded !== undefined) {
      return decoded
    }

    if (Object.keys(raw).some(k => escapedKeyPattern.test(k))) {
      return renameKeys(raw, k => (escapedKeyPattern.test(k) ? k.slice(1) : k))
    }

    return raw
  })
