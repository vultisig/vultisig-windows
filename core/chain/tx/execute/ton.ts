import { OtherChain } from '@core/chain/Chain'

import { ExecuteTxResolver } from './ExecuteTxResolver'

export const executeTonTx: ExecuteTxResolver<OtherChain.Ton> = async ({
  tx,
}) => {
  const txHash = Buffer.from(tx.hash).toString('hex')
  return { txHash }
}
