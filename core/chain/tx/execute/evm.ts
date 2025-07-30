import { EvmChain } from '@core/chain/Chain'
import { keccak256 } from 'viem'

import { ExecuteTxResolver } from './ExecuteTxResolver'

export const executeEvmTx: ExecuteTxResolver<EvmChain> = async ({ tx }) => {
  const txHash = keccak256(tx.encoded)
  return { txHash }
}
