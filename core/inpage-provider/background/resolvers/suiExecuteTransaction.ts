import { BackgroundResolver } from '@core/inpage-provider/background/resolver'
import { TW } from '@trustwallet/wallet-core'
import { OtherChain } from '@vultisig/core-chain/Chain'
import { broadcastSuiTx } from '@vultisig/core-chain/tx/broadcast/resolvers/sui'

/**
 * Broadcasts a signed Sui PTB and returns the execution result. Runs in the
 * extension service worker so the underlying `executeTransactionBlock` JSON-RPC
 * call uses the SDK's pinned Sui client and isn't blocked by the dApp page's
 * Content Security Policy — the inpage script forwards the signed transaction
 * here for the `sui:signAndExecuteTransaction*` features.
 */
export const suiExecuteTransaction: BackgroundResolver<
  'suiExecuteTransaction'
> = async ({ input: { transactionBytes, signature } }) =>
  broadcastSuiTx({
    chain: OtherChain.Sui,
    tx: TW.Sui.Proto.SigningOutput.create({
      unsignedTx: transactionBytes,
      signature,
    }),
  })
