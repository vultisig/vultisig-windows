import { OtherChain } from '@core/chain/Chain'
import { bytesToHex } from 'viem'

import { TxHashResolver } from './TxHashResolver'

export const getTronTxHash: TxHashResolver<OtherChain.Tron> = ({ id }) =>
  bytesToHex(id)
