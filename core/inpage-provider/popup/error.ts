export enum PopupError {
  RejectedByUser = 'rejectedByUser',
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
