import { callPopup } from '@core/inpage-provider/popup'
import { OtherChain } from '@vultisig/core-chain/Chain'

import { requestAccount } from '../core/requestAccount'

type SignRippleMessageInput = {
  /** Raw message from the dApp: hex when `isHex`, otherwise UTF-8 text. */
  message: string
  isHex: boolean
}

/**
 * Signs a personal message with the active vault's XRP key through the standard
 * signMessage keysign popup, returning GemWallet's `signedMessage`.
 *
 * `requestAccount` runs first so an unauthorized origin hits the grant-access
 * flow before anything is signed, and its address scopes the popup to the
 * active vault. The popup hashes the message (SHA-512-half) and DER-encodes the
 * signature — this layer only normalizes the casing XRPL verifiers expect.
 */
export const signRippleMessage = async ({
  message,
  isHex,
}: SignRippleMessageInput): Promise<string> => {
  const { address } = await requestAccount(OtherChain.Ripple)

  const signature = await callPopup(
    {
      signMessage: {
        sign_message: {
          chain: OtherChain.Ripple,
          message,
          isHex,
        },
      },
    },
    { account: address }
  )

  // `ripple-keypairs` (and every XRPL verifier) emits DER signatures as
  // uppercase hex; the keysign flow returns lowercase, so normalize.
  return signature.toUpperCase()
}
