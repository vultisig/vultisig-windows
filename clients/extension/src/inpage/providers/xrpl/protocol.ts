/**
 * Wire format spoken by the `@gemwallet/api` SDK.
 *
 * The XRPL adapter is detectable as GemWallet: XRPL dApps reach it through that
 * SDK, which talks over a bespoke `window.postMessage` protocol rather than an
 * injected object API. The envelopes below are therefore a hard contract —
 * reproduced from the shipped SDK, and anything that drifts from them makes us
 * undetectable — so the `GEM_WALLET_*` string values must never change even
 * though the surrounding identifiers are named for the adapter.
 */

/** `app` tag the SDK stamps on every request it emits. */
export const xrplAppTag = 'gem-wallet'

/** `source` tag on dApp → wallet messages. */
export const xrplRequestSource = 'GEM_WALLET_MSG_REQUEST'

/** `source` tag on wallet → dApp messages. */
export const xrplResponseSource = 'GEM_WALLET_MSG_RESPONSE'

/**
 * Request types this adapter answers: detection, account reads, message
 * signing, the raw sign / submit surface, and the payment / trustline / offer
 * convenience methods. Anything else — NFT operations, bulk submits, and
 * account/key changes (`AccountSet`, `SetRegularKey`, hooks) — is refused in
 * `resolveXrplRequest` rather than left to hang.
 */
export const xrplRequestTypes = [
  'REQUEST_IS_INSTALLED/V3',
  'REQUEST_GET_ADDRESS/V3',
  'REQUEST_GET_PUBLIC_KEY/V3',
  'REQUEST_GET_NETWORK/V3',
  'REQUEST_SIGN_MESSAGE/V3',
  'REQUEST_SIGN_TRANSACTION/V3',
  'REQUEST_SUBMIT_TRANSACTION/V3',
  'REQUEST_SEND_PAYMENT/V3',
  'REQUEST_SET_TRUSTLINE/V3',
  'REQUEST_CREATE_OFFER/V3',
  'REQUEST_CANCEL_OFFER/V3',
] as const

/** A request `type` string this adapter implements (see `xrplRequestTypes`). */
export type XrplRequestType = (typeof xrplRequestTypes)[number]

/**
 * A `GEM_WALLET_MSG_REQUEST` envelope, narrowed to the fields we act on.
 * `payload` is opaque here — the sign / submit / message handlers validate it —
 * and absent for the read methods.
 */
type XrplRequest = {
  messageId: number
  type: string
  payload?: unknown
}

/** Error shape the SDK hands to `deserializeError` and rethrows to the dApp. */
export type XrplSerializedError = {
  name: string
  message: string
  stack?: string
}

/**
 * Body merged into the response envelope. `result: undefined` is not a no-op:
 * the SDK maps a result-less response to `{ type: 'reject' }`, which is the
 * branch dApps take when the user declines.
 */
export type XrplResponseBody =
  | { isInstalled: true; result: { isInstalled: true } }
  | { result: { address: string } }
  | { result: { address: string; publicKey: string } }
  | { result: { chain: string; network: string; websocket: string } }
  | { result: { signedMessage: string } }
  | { result: { signature: string } }
  | { result: { hash: string } }
  | { result: undefined }
  | { error: XrplSerializedError }

const supportedRequestTypes: readonly string[] = xrplRequestTypes

/** Narrows a raw `type` string to a request type this adapter implements. */
export const isXrplRequestType = (type: string): type is XrplRequestType =>
  supportedRequestTypes.includes(type)

/**
 * Validates an inbound `message` payload as an adapter request, returning
 * `null` for anything else on the page — including our own responses, which
 * land back on this same listener.
 */
export const parseXrplRequest = (data: unknown): XrplRequest | null => {
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

  if (source !== xrplRequestSource || app !== xrplAppTag) return null
  if (typeof messageId !== 'number' || typeof type !== 'string') return null

  const payload = 'payload' in data ? data.payload : undefined

  return { messageId, type, payload }
}

/**
 * Builds the response envelope.
 *
 * The correlation key really is `messagedId`. It is a typo baked into the
 * SDK's own wire format (it posts `messageId` and filters replies on
 * `messagedId`), so spelling it correctly here would strand every request.
 */
export const buildXrplResponse = (
  messageId: number,
  body: XrplResponseBody
) => ({
  source: xrplResponseSource,
  messagedId: messageId,
  ...body,
})
