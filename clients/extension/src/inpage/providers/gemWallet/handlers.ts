import { OtherChain } from '@vultisig/core-chain/Chain'

import { requestAccount } from '../core/requestAccount'
import { GemWalletRequestType, GemWalletResponseBody } from './protocol'
import { signRippleTransaction } from './signRippleTransaction'

/**
 * We only ever derive XRPL mainnet accounts, so the network answer is constant.
 * `websocket` is the public mainnet cluster the SDK's own constants point at —
 * dApps read it back to open their own `xrpl.js` client.
 */
const xrplMainnet = {
  chain: 'XRPL',
  network: 'Mainnet',
  websocket: 'wss://xrplcluster.com',
}

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
    throw new Error('GemWallet transaction request is missing a transaction')
  }

  return payload.transaction
}

/**
 * Resolvers for the GemWallet request types this bridge implements, keyed by
 * request type and handed the request payload (`undefined` for the reads).
 *
 * Every vault-touching method routes through `requestAccount` /
 * `signRippleTransaction`, so an unauthorized origin gets the standard
 * grant-access popup and nothing is read or signed until the user approves.
 * `isInstalled` and `getNetwork` expose nothing vault-specific and answer
 * without a prompt.
 */
export const gemWalletHandlers: Record<
  GemWalletRequestType,
  (payload: unknown) => Promise<GemWalletResponseBody>
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
