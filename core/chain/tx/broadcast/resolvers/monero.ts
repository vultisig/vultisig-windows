import { submitRawTx } from '@core/chain/chains/monero/daemonRpc'

import { BroadcastTxResolver } from '../resolver'

export const broadcastMoneroTx: BroadcastTxResolver = async ({ tx }) => {
  const txData = tx as unknown as {
    encoded?: Uint8Array
  }
  const encoded = txData.encoded ?? new Uint8Array()
  const txHex = Buffer.from(encoded).toString('hex')
  await submitRawTx(txHex)
}
