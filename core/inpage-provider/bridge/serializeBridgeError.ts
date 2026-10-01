import { attempt } from '@vultisig/lib-utils/attempt'
import { extractErrorMsg } from '@vultisig/lib-utils/error/extractErrorMsg'

const internalErrorCode = -32603

type SerializedBridgeError = {
  code: number
  message: string
  data?: unknown
}

const hasRpcErrorShape = (
  value: unknown
): value is { code: number; message: string; data?: unknown } =>
  typeof value === 'object' &&
  value !== null &&
  'code' in value &&
  typeof value.code === 'number' &&
  'message' in value &&
  typeof value.message === 'string'

const isJsonSafe = (value: unknown) =>
  'data' in attempt(() => JSON.stringify(value))

/**
 * Turns a failure caught in the background into a value that survives the
 * `chrome.runtime` hop, which JSON-serializes replies and would otherwise
 * flatten an `Error` instance into `{}` — leaving dApps with a bare
 * `-32603 "Internal error"` and no hint of the real cause.
 *
 * Strings pass through untouched because sentinels such as
 * `PopupError.RejectedByUser` and `BackgroundError.Unauthorized` are matched
 * by identity downstream. Everything else becomes `{ code, message, data? }`,
 * keeping a node's JSON-RPC code and revert data when it has them and falling
 * back to `-32603` with the original message otherwise.
 */
export const serializeBridgeError = (
  error: unknown
): string | SerializedBridgeError => {
  if (typeof error === 'string') {
    return error
  }

  if (hasRpcErrorShape(error)) {
    const { code, message, data } = error

    return data !== undefined && isJsonSafe(data)
      ? { code, message, data }
      : { code, message }
  }

  return { code: internalErrorCode, message: extractErrorMsg(error) }
}
