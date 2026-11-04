import { EvmChain } from '@vultisig/core-chain/Chain'
import { getEvmNumericChainId } from '@vultisig/core-chain/chains/evm/chainInfo'

import { queryOneInchApi } from './queryOneInchApi'

type GetSpenderAllowancesInput = {
  chain: EvmChain
  owner: string
  spender: string
  tokens: string[]
}

/**
 * Reads the owner's current allowance for one spender on each of the given
 * tokens via 1inch's Balance API, keyed by lowercased token address.
 */
export const getSpenderAllowances = async ({
  chain,
  owner,
  spender,
  tokens,
}: GetSpenderAllowancesInput): Promise<Record<string, bigint>> => {
  const response = await queryOneInchApi<Record<string, string>>({
    path: `/balance/v1.2/${getEvmNumericChainId(chain)}/allowances/${spender}/${owner}`,
    body: { tokens },
  })

  const allowances = Object.fromEntries(
    Object.entries(response).map(([token, allowance]) => [
      token.toLowerCase(),
      BigInt(allowance),
    ])
  )

  // The response also lists the native coin, so keep only what was asked for.
  return Object.fromEntries(
    tokens.flatMap(token => {
      const allowance = allowances[token.toLowerCase()]
      return allowance === undefined ? [] : [[token.toLowerCase(), allowance]]
    })
  )
}
