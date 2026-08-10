export enum PopupError {
  RejectedByUser = 'rejectedByUser',
  SigningFailed = 'signingFailed',
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
 */
const popupErrorMessages = new Map<string, string>([
  [
    PopupError.SigningFailed,
    'Signing failed in the Vultisig popup. The transaction was not signed.',
  ],
  [
    PopupError.CallNotFound,
    'Vultisig could not load the pending request. It may have expired.',
  ],
])

/**
 * dApp-facing wording for a popup failure sentinel, or `undefined` when the
 * value is not one that carries its own message. Lets provider-side
 * translators keep the readable text without matching on each sentinel.
 */
export const getPopupErrorMessage = (error: unknown): string | undefined =>
  typeof error === 'string' ? popupErrorMessages.get(error) : undefined
