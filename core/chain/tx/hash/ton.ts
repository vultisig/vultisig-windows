import { OtherChain } from '@core/chain/Chain'

import { TxHashResolver } from './TxHashResolver'

export const getTonTxHash: TxHashResolver<OtherChain.Ton> = ({ hash }) => {
  const txHash = Buffer.from(hash).toString('hex')
  return txHash
}
