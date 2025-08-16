import { EvmChain } from '@core/chain/Chain'
import { keccak256 } from 'viem'

import { TxHashResolver } from '../resolver'

export const getEvmTxHash: TxHashResolver<EvmChain> = ({ encoded }) =>
  keccak256(encoded)
