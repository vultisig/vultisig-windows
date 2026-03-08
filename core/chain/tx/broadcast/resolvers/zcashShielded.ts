import { sendTransaction } from '@core/chain/chains/zcash/lightwalletd/client'

import { BroadcastTxResolver } from '../resolver'

export const broadcastZcashShieldedTx: BroadcastTxResolver = async ({ tx }) => {
  const txData = tx as unknown as {
    encoded?: Uint8Array
    signingResultV2?: { encoded?: Uint8Array }
  }
  const encoded =
    txData.signingResultV2?.encoded ?? txData.encoded ?? new Uint8Array()

  const response = await sendTransaction(encoded)
  if (response.errorCode !== 0) {
    throw new Error(
      `Lightwalletd broadcast failed: ${response.errorMessage} (code ${response.errorCode})`
    )
  }
}
