/**
 * Wire format spoken by the `@gemwallet/api` SDK.
 *
 * XRPL dApps reach GemWallet through that SDK, which talks to the wallet over a
 * bespoke `window.postMessage` protocol rather than an injected object API. The
 * envelopes below are therefore a hard contract: they are reproduced from the
 * shipped SDK, and anything that drifts from them makes us undetectable.
 */

/** `app` tag the SDK stamps on every request it emits. */
export const gemWalletApp = 'gem-wallet'

/** `source` tag on dApp → wallet messages. */
export const gemWalletRequestSource = 'GEM_WALLET_MSG_REQUEST'

/** `source` tag on wallet → dApp messages. */
export const gemWalletResponseSource = 'GEM_WALLET_MSG_RESPONSE'

/**
 * Request types this bridge answers: detection and account reads only. Signing
 * is deliberately absent — see `resolveGemWalletRequest` for how the rest are
 * turned away.
 */
export const gemWalletRequestTypes = [
  'REQUEST_IS_INSTALLED/V3',
  'REQUEST_GET_ADDRESS/V3',
  'REQUEST_GET_PUBLIC_KEY/V3',
  'REQUEST_GET_NETWORK/V3',
] as const

export type GemWalletRequestType = (typeof gemWalletRequestTypes)[number]

/** A `GEM_WALLET_MSG_REQUEST` envelope, narrowed to the fields we act on. */
type GemWalletRequest = {
  messageId: number
  type: string
}

/** Error shape the SDK hands to `deserializeError` and rethrows to the dApp. */
export type GemWalletSerializedError = {
  name: string
  message: string
  stack?: string
}

/**
 * Body merged into the response envelope. `result: undefined` is not a no-op:
 * the SDK maps a result-less response to `{ type: 'reject' }`, which is the
 * branch dApps take when the user declines.
 */
export type GemWalletResponseBody =
  | { isInstalled: true; result: { isInstalled: true } }
  | { result: { address: string } }
  | { result: { address: string; publicKey: string } }
  | { result: { chain: string; network: string; websocket: string } }
  | { result: undefined }
  | { error: GemWalletSerializedError }

const supportedRequestTypes: readonly string[] = gemWalletRequestTypes

/** Narrows a raw `type` string to a request type this bridge implements. */
export const isGemWalletRequestType = (
  type: string
): type is GemWalletRequestType => supportedRequestTypes.includes(type)

/**
 * Validates an inbound `message` payload as a GemWallet request, returning
 * `null` for anything else on the page — including our own responses, which
 * land back on this same listener.
 */
export const parseGemWalletRequest = (
  data: unknown
): GemWalletRequest | null => {
  if (typeof data !== 'object' || data === null) return null
  if (
    !(
      'source' in data &&
      'app' in data &&
      'messageId' in data &&
      'type' in data
    )
  )
    return null

  const { source, app, messageId, type } = data

  if (source !== gemWalletRequestSource || app !== gemWalletApp) return null
  if (typeof messageId !== 'number' || typeof type !== 'string') return null

  return { messageId, type }
}

/**
 * Builds the response envelope.
 *
 * The correlation key really is `messagedId`. It is a typo baked into the
 * SDK's own wire format (it posts `messageId` and filters replies on
 * `messagedId`), so spelling it correctly here would strand every request.
 */
export const buildGemWalletResponse = (
  messageId: number,
  body: GemWalletResponseBody
) => ({
  source: gemWalletResponseSource,
  messagedId: messageId,
  ...body,
})
