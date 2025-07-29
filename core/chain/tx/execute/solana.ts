import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'
import { getSolanaClient } from '@core/chain/chains/solana/client'
import { assertErrorMessage } from '@lib/utils/error/assertErrorMessage'
import { Base64EncodedWireTransaction } from '@solana/web3.js'
import { TW } from '@trustwallet/wallet-core'

import { ExecuteTxResolver } from './ExecuteTxResolver'

export const executeSolanaTx: ExecuteTxResolver = async ({
  compiledTx,
  skipBroadcast,
}) => {
  const { encoded, errorMessage: solanaErrorMessage } =
    TW.Solana.Proto.SigningOutput.decode(compiledTx)

  assertErrorMessage(solanaErrorMessage)
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
