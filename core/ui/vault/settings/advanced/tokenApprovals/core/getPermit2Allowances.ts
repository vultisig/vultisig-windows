import { EvmChain } from '@vultisig/core-chain/Chain'
import { getEvmClient } from '@vultisig/core-chain/chains/evm/client'
import { withoutDuplicates } from '@vultisig/lib-utils/array/withoutDuplicates'
import { attempt } from '@vultisig/lib-utils/attempt'
import { erc20Abi, getAddress } from 'viem'

import { TokenSpender } from './getApprovedTokenSpenders'
import { isPermit2LogChain, permit2Abi, permit2Address } from './permit2'

type GetPermit2AllowancesInput = {
  chain: EvmChain
  owner: string
  /** Pairs from the approval history worth checking on Permit2. */
  candidates: TokenSpender[]
}

/** A live Permit2 allowance, token and spender lowercased. */
type Permit2Allowance = TokenSpender & {
  amount: bigint
  expiration: number
}

type Permit2Allowances = {
  allowances: Permit2Allowance[]
  /** False when Permit2's logs could not be read, so pairs may be missing. */
  isComplete: boolean
}

const readLoggedPairs = async ({
  chain,
  owner,
}: Pick<GetPermit2AllowancesInput, 'chain' | 'owner'>) => {
  const client = getEvmClient(chain)
  const logs = await Promise.all(
    (['Approval', 'Permit'] as const).map(eventName =>
      client.getContractEvents({
        address: permit2Address,
        abi: permit2Abi,
        eventName,
        args: { owner: getAddress(owner) },
        fromBlock: 0n,
        strict: true,
      })
    )
  )

  return logs.flat().map(({ args: { token, spender } }) => ({
    token: token.toLowerCase(),
    spender: spender.toLowerCase(),
  }))
}

/**
 * Reads the owner's Permit2 allowances for the candidate pairs, plus every
 * pair Permit2's own logs name where the RPC can serve them. Keeps those with
 * an amount left that have not expired, on tokens the owner still lets
 * Permit2 spend; without that ERC-20 approval Permit2 cannot move the token.
 */
export const getPermit2Allowances = async ({
  chain,
  owner,
  candidates,
}: GetPermit2AllowancesInput): Promise<Permit2Allowances> => {
  // A failed log read only flags the result incomplete, so the network's ERC-20 rows still show.
  const logged = isPermit2LogChain(chain)
    ? await attempt(() => readLoggedPairs({ chain, owner }))
    : null
  const loggedPairs = logged?.data ?? []
  const isComplete = logged === null || logged.data !== undefined

  const pairs = withoutDuplicates(
    [...candidates, ...loggedPairs],
    (a, b) => a.token === b.token && a.spender === b.spender
  )
  if (pairs.length === 0) {
    return { allowances: [], isComplete }
  }

  const client = getEvmClient(chain)
  const tokens = [...new Set(pairs.map(({ token }) => token))]

  // A failed read drops its pair and flags the result incomplete, never reads as no allowance.
  const [permit2Results, rootResults] = await Promise.all([
    client.multicall({
      contracts: pairs.map(
        ({ token, spender }) =>
          ({
            address: permit2Address,
            abi: permit2Abi,
            functionName: 'allowance',
            args: [getAddress(owner), getAddress(token), getAddress(spender)],
          }) as const
      ),
    }),
    client.multicall({
      contracts: tokens.map(
        token =>
          ({
            address: getAddress(token),
            abi: erc20Abi,
            functionName: 'allowance',
            args: [getAddress(owner), permit2Address],
          }) as const
      ),
    }),
  ])

  const permit2Enabled = new Set(
    tokens.filter((_, index) => {
      const root = rootResults[index]
      return root.status === 'success' && root.result > 0n
    })
  )
  const now = Math.floor(Date.now() / 1000)

  const allowances = pairs.flatMap((pair, index) => {
    const read = permit2Results[index]
    if (read.status !== 'success') return []
    const [amount, expiration] = read.result
    return amount > 0n && expiration >= now && permit2Enabled.has(pair.token)
      ? [{ ...pair, amount, expiration }]
      : []
  })
  const hasFailedRead = [...permit2Results, ...rootResults].some(
    ({ status }) => status !== 'success'
  )

  return { allowances, isComplete: isComplete && !hasFailedRead }
}
