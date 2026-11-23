import { base64Encode } from '@vultisig/lib-utils/base64Encode'
import { fromBase64 } from '@vultisig/lib-utils/fromBase64'

const bigintTag = '__bigint'
const bytesTag = '__bytes'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

/**
 * Turns a value into plain JSON that extension storage keeps intact. Chrome
 * storage can't hold `bigint` and flattens `Uint8Array` into a keyed object,
 * and keysign payloads carry both, so they are tagged here.
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
          return { [bigintTag]: raw.toString() }
        }

        if (raw instanceof Uint8Array) {
          return { [bytesTag]: base64Encode(raw) }
        }

        return value
      }
    )
  )

/**
 * Restores a value written by `toStorableValue`. Untagged plain values pass
 * through unchanged.
 */
export const fromStorableValue = <T>(value: unknown): T =>
  JSON.parse(JSON.stringify(value), (_key, raw: unknown) => {
    if (isRecord(raw)) {
      const bigint = raw[bigintTag]
      if (typeof bigint === 'string') {
        return BigInt(bigint)
      }

      const bytes = raw[bytesTag]
      if (typeof bytes === 'string') {
        return new Uint8Array(fromBase64(bytes))
      }
    }

    return raw
  })
