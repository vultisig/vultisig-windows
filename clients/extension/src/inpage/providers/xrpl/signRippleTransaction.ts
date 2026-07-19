import { callPopup } from '@core/inpage-provider/popup'
import { OtherChain } from '@vultisig/core-chain/Chain'
import { Buffer } from 'buffer'

import { requestAccount } from '../core/requestAccount'

type SignRippleTransactionInput = {
  /** Raw XRPL transaction JSON from the dApp. Sanitized in the popup, never here. */
  transaction: unknown
  /** Submit path signs and broadcasts; sign path stops at the signed blob. */
  broadcast: boolean
}

type SignRippleTransactionResult = {
  hash: string
  /** Signed transaction blob (`tx_blob`), uppercase hex — GemWallet's `signature`. */
  signature: string
}

/**
 * Drives a dApp-supplied XRPL transaction through the standard keysign popup.
 *
 * `requestAccount` runs first so an unauthorized origin hits the normal
 * grant-access flow before anything is signed, and its address scopes the
 * popup to the active vault. The transaction is forwarded verbatim — the popup
 * sanitizes it (allowlist, `Account` pinning) and autofills the envelope — so
 * this layer stays a thin transport with no XRPL-specific trust.
 */
export const signRippleTransaction = async ({
  transaction,
  broadcast,
}: SignRippleTransactionInput): Promise<SignRippleTransactionResult> => {
  const { address } = await requestAccount(OtherChain.Ripple)

  const [{ hash, data }] = await callPopup(
    {
      sendTx: {
        serialized: {
          data: [JSON.stringify(transaction)],
          chain: OtherChain.Ripple,
          skipBroadcast: !broadcast,
        },
      },
    },
    { account: address }
  )

  const encoded = data.encoded
  if (typeof encoded !== 'string') {
    throw new Error('Ripple signing output is missing the encoded blob')
  }

  return {
    hash,
    signature: Buffer.from(encoded, 'base64').toString('hex').toUpperCase(),
  }
}
