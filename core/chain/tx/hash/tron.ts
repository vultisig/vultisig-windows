import { OtherChain } from '@core/chain/Chain'
import { bytesToHex } from 'viem'

import { GetTxHashResolver } from './GetTxHashResolver'

export const getTronTxHash: GetTxHashResolver<OtherChain.Tron> = ({ id }) => {
  return bytesToHex(id)
}
