import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'
import { OtherChain } from '@core/chain/Chain'
import { getSolanaClient } from '@core/chain/chains/solana/client'
import { Base64EncodedWireTransaction } from '@solana/web3.js'

import { ExecuteTxResolver } from './ExecuteTxResolver'

export const executeSolanaTx: ExecuteTxResolver<OtherChain.Solana> = async ({
  chain,
  tx,
  skipBroadcast,
}) => {
  const { encoded } = tx
  if (skipBroadcast) {
    const rawTx = Buffer.from(encoded, 'base64')
    const txHash = bs58.encode(Uint8Array.prototype.slice.call(rawTx, 1, 65))
    return { txHash, encoded }
  }

  const client = getSolanaClient()

  const result = await client
    .sendTransaction(encoded as Base64EncodedWireTransaction, {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
      maxRetries: BigInt(3),
    })
    .send()

  return { txHash: result, encoded }
}
