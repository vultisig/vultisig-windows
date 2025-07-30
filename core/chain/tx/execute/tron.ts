import { OtherChain } from '@core/chain/Chain'
import { bytesToHex } from 'viem'

import { ExecuteTxResolver } from './ExecuteTxResolver'

export const executeTronTx: ExecuteTxResolver<OtherChain.Tron> = async ({
  tx,
}) => {
  return { txHash: bytesToHex(tx.id) }
}
