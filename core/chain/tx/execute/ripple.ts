import { OtherChain } from '@core/chain/Chain'
import { sha512 } from 'ethers'

import { ExecuteTxResolver } from './ExecuteTxResolver'

export const executeRippleTx: ExecuteTxResolver<OtherChain.Ripple> = async ({
  tx,
}) => {
  const fullHash = sha512(tx.encoded)
  const first256 = fullHash.slice(0, 32) // first 256 bits (32 bytes)
  return { txHash: Buffer.from(first256).toString('hex').toUpperCase() }
}
