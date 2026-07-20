import { OtherChain } from '@vultisig/core-chain/Chain'

import { requestAccount } from '../core/requestAccount'
import { xrplMainnet } from './network'
import { XrplRequestType, XrplResponseBody } from './protocol'
import { signRippleMessage } from './signRippleMessage'
import { signRippleTransaction } from './signRippleTransaction'

const getRippleAccount = () => requestAccount(OtherChain.Ripple)

/**
 * The sign / submit request payload the SDK sends: `{ transaction: <XRPL tx> }`.
 * The transaction stays opaque here — the keysign popup sanitizes it — so this
 * only reaches in far enough to find it.
 */
const getRequestedTransaction = (payload: unknown): unknown => {
  if (
    typeof payload !== 'object' ||
    payload === null ||
    !('transaction' in payload) ||
    // `'transaction' in payload` passes when the key is present but null /
    // undefined; reject that too so a garbage `[undefined]` never reaches the
    // popup instead of this clear error.
    payload.transaction == null
  ) {
    throw new Error('XRPL transaction request is missing a transaction')
  }

  return payload.transaction
}

/**
 * The sign-message request payload the SDK sends: `{ message, isHex, ... }`.
 * `message` is required; `isHex` is optional and only `true` opts into hex.
 */
const getRequestedMessage = (
  payload: unknown
): { message: string; isHex: boolean } => {
  if (
    typeof payload !== 'object' ||
    payload === null ||
    !('message' in payload) ||
    typeof payload.message !== 'string'
  ) {
    throw new Error('XRPL sign-message request is missing a message')
  }

  return {
    message: payload.message,
    isHex: 'isHex' in payload && payload.isHex === true,
  }
}

/**
 * Resolvers for the XRPL request types this adapter implements, keyed by request
 * type and handed the request payload (`undefined` for the reads).
 *
 * Every vault-touching method routes through `requestAccount` /
 * `signRippleTransaction` / `signRippleMessage`, so an unauthorized origin gets
 * the standard grant-access popup and nothing is read or signed until the user
 * approves. `isInstalled` and `getNetwork` expose nothing vault-specific and
 * answer without a prompt.
 */
export const xrplRequestHandlers: Record<
  XrplRequestType,
  (payload: unknown) => Promise<XrplResponseBody>
> = {
  'REQUEST_IS_INSTALLED/V3': async () => ({
    // The shipped SDK reads a flat `isInstalled`, while its published types
    // declare it nested under `result`. Answer both so either reader is happy.
    isInstalled: true,
    result: { isInstalled: true },
  }),
  'REQUEST_GET_ADDRESS/V3': async () => {
    const { address } = await getRippleAccount()

    return { result: { address } }
  },
  'REQUEST_GET_PUBLIC_KEY/V3': async () => {
    const { address, publicKey } = await getRippleAccount()

    // XRPL tooling emits account public keys as uppercase hex, and dApps feed
    // this straight back into `xrpl.js`.
    return { result: { address, publicKey: publicKey.toUpperCase() } }
  },
  'REQUEST_GET_NETWORK/V3': async () => ({ result: xrplMainnet }),
  'REQUEST_SIGN_MESSAGE/V3': async payload => {
    const { message, isHex } = getRequestedMessage(payload)

    const signedMessage = await signRippleMessage({ message, isHex })

    return { result: { signedMessage } }
  },
  'REQUEST_SIGN_TRANSACTION/V3': async payload => {
    const { signature } = await signRippleTransaction({
      transaction: getRequestedTransaction(payload),
      broadcast: false,
    })

    return { result: { signature } }
  },
  'REQUEST_SUBMIT_TRANSACTION/V3': async payload => {
    const { hash } = await signRippleTransaction({
      transaction: getRequestedTransaction(payload),
      broadcast: true,
    })

    return { result: { hash } }
  },
}
