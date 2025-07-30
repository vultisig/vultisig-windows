import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'
import { OtherChain } from '@core/chain/Chain'

import { GetTxHashResolver } from './GetTxHashResolver'

export const getSolanaTxHash: GetTxHashResolver<OtherChain.Solana> = ({
  encoded,
}) => {
  const rawTx = Buffer.from(encoded, 'base64')
  const txHash = bs58.encode(Uint8Array.prototype.slice.call(rawTx, 1, 65))
  return txHash
}
