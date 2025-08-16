import { OtherChain } from '@core/chain/Chain'
import { stripHexPrefix } from '@lib/utils/hex/stripHexPrefix'
import { bytesToHex } from 'viem'

import { TxHashResolver } from '../resolver'

export const getTronTxHash: TxHashResolver<OtherChain.Tron> = ({ id }) =>
  stripHexPrefix(bytesToHex(id))
