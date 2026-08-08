import { BackgroundResolver } from '@core/inpage-provider/background/resolver'
import { deserializeSigningOutput } from '@vultisig/core-chain/tw/signingOutput'
import { broadcastTx as broadcastChainTx } from '@vultisig/core-chain/tx/broadcast'
import { getTxHash } from '@vultisig/core-chain/tx/hash'

/**
 * Broadcasts a fully signed Cosmos transaction and returns its hash.
 *
 * This backs the Keplr `sendTx` provider method: cosmos-kit dApps sign with
 * `signDirect` / `signAmino` (which Vultisig handles with `skipBroadcast`) and
 * then call `sendTx` with the encoded `TxRaw` bytes to publish it. Broadcasting
 * runs in the background service worker — like real Keplr — so it isn't blocked
 * by the dApp page's CSP.
 *
 * The dApp's `TxRaw` bytes are wrapped in the Cosmos signing-output shape the
 * SDK's broadcast/hash resolvers expect (`serialized.tx_bytes`), then handed to
 * the shared `broadcastTx` — which swallows duplicate-broadcast errors and
 * verifies inclusion by hash — and `getTxHash`. Broadcast rejection (e.g.
 * insufficient fee) propagates so the dApp sees the real failure.
 */
export const broadcastTx: BackgroundResolver<'broadcastTx'> = async ({
  input: { chain, txBytes },
}) => {
  const tx = deserializeSigningOutput(chain, {
    serialized: JSON.stringify({ tx_bytes: txBytes }),
  })

  const txHash = await getTxHash({ chain, tx })

  await broadcastChainTx({ chain, tx })

  return { txHash }
}
