import { EvmChain } from '@core/chain/Chain'
import { keccak256 } from 'viem'

import { GetTxHashResolver } from './GetTxHashResolver'

export const getEvmTxHash: GetTxHashResolver<EvmChain> = ({ encoded }) =>
  keccak256(encoded)
