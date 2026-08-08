import { PopupError } from '@core/inpage-provider/popup/error'

import { EIP1193Error } from '../../../background/handlers/errorHandler'

type ProviderRpcErrorLike = {
  code: number
  message: string
  data?: unknown
}

const isProviderRpcErrorLike = (
  value: unknown
): value is ProviderRpcErrorLike => {
  if (typeof value !== 'object' || value === null) return false
  if (!('code' in value) || typeof value.code !== 'number') return false
  if (!('message' in value) || typeof value.message !== 'string') return false
  return true
}

const internalErrorCode = -32603

/**
 * Normalize any value thrown out of an EVM resolver into an
 * EIP-1193 `ProviderRpcError`.
 *
 * EIP-1193 §5.4 requires providers to reject with an `Error` instance
 * carrying a numeric `code`. Internally the wallet rejects popup calls
 * with the plain `PopupError.RejectedByUser` string, and background
 * plumbing can surface other shapes (e.g. node JSON-RPC errors with
 * revert `data`). This routes them all through a single conversion.
 *
 * - `EIP1193Error` passes through by reference.
 * - `PopupError.RejectedByUser` → `EIP1193Error('UserRejectedRequest')` (code 4001).
 * - `{ code: number, message: string, data? }` → preserved on a new
 *   `EIP1193Error`, keeping `data` for things like revert reasons.
 * - Any `Error` instance → `InternalError` (-32603) with its original
 *   message preserved so diagnostics (e.g. `wallet_watchAsset`
 *   validation) are not lost.
 * - Non-empty strings → `InternalError` with the string as the message.
 * - Anything else → `InternalError` with the default message.
 */
export const toEip1193Error = (error: unknown): EIP1193Error => {
  if (error instanceof EIP1193Error) {
    return error
  }

  if (error === PopupError.RejectedByUser) {
    return new EIP1193Error('UserRejectedRequest')
  }

  if (isProviderRpcErrorLike(error)) {
    return new EIP1193Error({
      code: error.code,
      message: error.message,
      data: error.data,
    })
  }

  if (error instanceof Error && error.message.length > 0) {
    return new EIP1193Error({
      code: internalErrorCode,
      message: error.message,
    })
  }

  if (typeof error === 'string' && error.length > 0) {
    return new EIP1193Error({
      code: internalErrorCode,
      message: error,
    })
  }

  return new EIP1193Error('InternalError')
}
