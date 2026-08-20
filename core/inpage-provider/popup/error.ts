export enum PopupError {
  RejectedByUser = 'rejectedByUser',
  SigningFailed = 'signingFailed',
  BroadcastFailed = 'broadcastFailed',
  CallNotFound = 'callNotFound',
}

/**
 * Result a popup view finishes with when the user declines the request.
 *
 * The sentinel has to stay a plain string: popup responses cross
 * `chrome.runtime` messaging, which serializes them, so an `Error` instance
 * arrives as a bare object that no consumer recognises as a rejection —
 * dApps then see EIP-1193 `-32603 Internal error` instead of
 * `4001 UserRejectedRequest`.
 */
export const userRejectedPopupResult = {
  error: PopupError.RejectedByUser,
} as const

/**
 * Result a popup view finishes with when signing fails rather than being
 * declined. Kept a plain string for the same serialization reason as
 * {@link userRejectedPopupResult}; `toEip1193Error` turns it into an
 * `InternalError` whose message names the failure instead of the generic
 * `"Internal error"`.
 */
export const signingFailedPopupResult = {
  error: PopupError.SigningFailed,
} as const

/**
 * Result a popup view finishes with when signing succeeded but the network
 * rejected the broadcast. Distinct from {@link signingFailedPopupResult}
 * because the transaction is signed and may yet be known to the chain, so a
 * dApp must not be told it was never signed.
 */
export const broadcastFailedPopupResult = {
  error: PopupError.BroadcastFailed,
} as const

/**
 * Result the popup shell finishes with when it cannot load the pending call
 * from storage, so no view ever renders. Plain string for the same
 * serialization reason as {@link userRejectedPopupResult}.
 */
export const callNotFoundPopupResult = {
  error: PopupError.CallNotFound,
} as const

/**
 * dApp-facing text for popup failures that carry no EIP-1193 code of their
 * own. The sentinels themselves stay terse identifiers for the wire, so
 * translators look the wording up here rather than surfacing `"signingFailed"`
 * to a dApp developer. `RejectedByUser` is absent on purpose: it maps to the
 * standard `4001 UserRejectedRequest`, which supplies its own message.
 *
 * Exhaustive over every other member, so adding a sentinel without wording is
 * a compile error rather than a silent fall back to `"Internal error"`.
 */
const messagesByPopupError: Record<
  Exclude<PopupError, PopupError.RejectedByUser>,
  string
> = {
  [PopupError.SigningFailed]:
    'Signing failed in the Vultisig popup. The transaction was not signed.',
  [PopupError.BroadcastFailed]:
    'The transaction was signed but the network rejected the broadcast.',
  [PopupError.CallNotFound]:
    'Vultisig could not load the pending request. It may have expired.',
}

const popupErrorMessages = new Map<string, string>(
  Object.entries(messagesByPopupError)
)

/**
 * dApp-facing wording for a popup failure sentinel, or `undefined` when the
 * value is not one that carries its own message. Lets provider-side
 * translators keep the readable text without matching on each sentinel.
 */
export const getPopupErrorMessage = (error: unknown): string | undefined =>
  typeof error === 'string' ? popupErrorMessages.get(error) : undefined

/**
 * The form a popup failure should reach dApp-facing provider code in.
 * `RejectedByUser` stays the bare sentinel because providers compare against
 * it by identity; every other sentinel becomes an `Error` carrying its
 * dApp-facing wording, so the many providers that simply let the rejection
 * propagate hand the dApp a readable message instead of the raw
 * `"signingFailed"` identifier. Applied once, at the inpage `callPopup`
 * boundary — the last hop before dApp code, so nothing serializes it again.
 */
export const toPopupCallError = (error: unknown): unknown => {
  const message = getPopupErrorMessage(error)

  return message ? new Error(message) : error
}
