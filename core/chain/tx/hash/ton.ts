import { OtherChain } from '@core/chain/Chain'

import { GetTxHashResolver } from './GetTxHashResolver'

export const getTonTxHash: GetTxHashResolver<OtherChain.Ton> = ({ hash }) => {
  const txHash = Buffer.from(hash).toString('hex')
  return txHash
}
