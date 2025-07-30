import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'
import { OtherChain } from '@core/chain/Chain'

import { ExecuteTxResolver } from './ExecuteTxResolver'

export const executeSolanaTx: ExecuteTxResolver<OtherChain.Solana> = async ({
  tx,
}) => {
  const rawTx = Buffer.from(tx.encoded, 'base64')
  const txHash = bs58.encode(Uint8Array.prototype.slice.call(rawTx, 1, 65))
  return { txHash, encoded: tx.encoded }
}
