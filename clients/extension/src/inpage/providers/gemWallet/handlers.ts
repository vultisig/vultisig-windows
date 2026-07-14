import { OtherChain } from '@vultisig/core-chain/Chain'

import { requestAccount } from '../core/requestAccount'
import { GemWalletRequestType, GemWalletResponseBody } from './protocol'

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
 * Resolvers for the GemWallet request types this bridge implements.
 *
 * `getAddress` and `getPublicKey` go through `requestAccount`, so an
 * unauthorized origin gets the standard grant-access popup and no address
 * leaves the wallet until the user approves. `isInstalled` and `getNetwork`
 * expose nothing vault-specific and answer without a prompt.
 */
export const gemWalletHandlers: Record<
  GemWalletRequestType,
  () => Promise<GemWalletResponseBody>
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
}
