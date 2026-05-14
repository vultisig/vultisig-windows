import { PopupError } from '@core/inpage-provider/popup/error'

import { EIP1193Error } from '../../../background/handlers/errorHandler'

// EIP-1193 §5.4 requires providers to reject with a `ProviderRpcError`
// (an `Error` carrying a numeric `code`). Internally the wallet rejects
// popup calls with the plain `PopupError.RejectedByUser` string and
// background plumbing can surface other shapes. This translates anything
// thrown out of an EVM resolver into a spec-conforming `EIP1193Error`.
export const toEip1193Error = (error: unknown): EIP1193Error => {
  if (error instanceof EIP1193Error) {
    return error
  }

  if (error === PopupError.RejectedByUser) {
    return new EIP1193Error('UserRejectedRequest')
  }

  // Preserve common `{ code, message }` shapes that already conform to
  // the spec but were thrown as plain objects rather than EIP1193Error
  // instances (e.g. errors bubbled up from background JSON-RPC calls).
  if (
    typeof error === 'object' &&
    error !== null &&
    typeof (error as { code?: unknown }).code === 'number' &&
    typeof (error as { message?: unknown }).message === 'string'
  ) {
    const wrapped = new EIP1193Error('InternalError')
    wrapped.code = (error as { code: number }).code
    wrapped.message = (error as { message: string }).message
    return wrapped
  }

  return new EIP1193Error('InternalError')
}
