import { getEvmClient } from '@vultisig/core-chain/chains/evm/client'

import { sVultAbi } from './abi'
import { sVultAddress, vultStakingEvmChain } from './config'

/** Reads the live cooldown (seconds) enforced between requestUnstake and claim. */
export const getVultCooldownDuration = (): Promise<bigint> =>
  getEvmClient(vultStakingEvmChain).readContract({
    address: sVultAddress,
    abi: sVultAbi,
    functionName: 'cooldownDuration',
  })
