import { OtherChain } from '@core/chain/Chain'

import { TxHashResolver } from '../resolver'

export const getTonTxHash: TxHashResolver<OtherChain.Ton> = ({ hash }) =>
  Buffer.from(hash).toString('hex')
