import { getEvmClient } from '@vultisig/core-chain/chains/evm/client'
import { getAbiItem, isAddress, zeroAddress } from 'viem'

import { sVultAbi } from './abi'
import {
  sVultAddress,
  sVultDeploymentBlock,
  vultStakingEvmChain,
} from './config'

export type PendingUnstake = {
  requestId: bigint
  /** sVULT amount locked in this request. */
  amount: bigint
  /** Unix ms timestamp when the request becomes claimable. */
  maturity: number
  /** True once the cooldown has elapsed and `claim` will succeed. */
  isClaimable: boolean
}

type GetPendingUnstakesInput = {
  ownerAddress: string
}

/**
 * Enumerates a vault's outstanding unstake requests. There is no on-chain list,
 * so we read `UnstakeRequested` logs for this owner, then keep only requests that
 * still exist on-chain (claimed/cancelled requests are zeroed out).
 */
export const getPendingUnstakes = async ({
  ownerAddress,
}: GetPendingUnstakesInput): Promise<PendingUnstake[]> => {
  if (!isAddress(ownerAddress)) {
    return []
  }

  const client = getEvmClient(vultStakingEvmChain)

  const logs = await client.getLogs({
    address: sVultAddress,
    event: getAbiItem({ abi: sVultAbi, name: 'UnstakeRequested' }),
    args: { owner: ownerAddress },
    fromBlock: sVultDeploymentBlock,
    toBlock: 'latest',
  })

  const requestIds = [
    ...new Set(
      logs.map(log => log.args.requestId).filter(id => id !== undefined)
    ),
  ]

  const requests = await Promise.all(
    requestIds.map(async requestId => {
      const [owner, maturity, amount] = await client.readContract({
        address: sVultAddress,
        abi: sVultAbi,
        functionName: 'getUnstakeRequest',
        args: [requestId],
      })

      if (amount === 0n || owner === zeroAddress) {
        return null
      }

      const isClaimable = await client.readContract({
        address: sVultAddress,
        abi: sVultAbi,
        functionName: 'isClaimable',
        args: [requestId],
      })

      return {
        requestId,
        amount,
        maturity: Number(maturity) * 1000,
        isClaimable,
      }
    })
  )

  return requests
    .filter((request): request is PendingUnstake => request !== null)
    .sort((a, b) => a.maturity - b.maturity)
}
