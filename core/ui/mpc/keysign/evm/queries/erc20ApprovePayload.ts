import { EvmChain } from '@core/chain/Chain'
import { AccountCoinKey } from '@core/chain/coin/AccountCoin'
import { usePotentialQuery } from '@lib/ui/query/hooks/usePotentialQuery'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { useMemo } from 'react'

import { getErc20AllowanceQuery } from '../../../../chain/evm/queries/erc20Allowance'

type Input = AccountCoinKey & {
  amount: bigint
  spender: string
}

export const useErc20ApprovePayloadQuery = (input: Input) => {
  const { chain, address, id, spender } = input

  return usePotentialQuery(
    useMemo(() => {
      if (isOneOf(chain, Object.values(EvmChain)) && id) {
        return {
          chain,
          spender,
          address,
          id,
        }
      }
    }, [chain, address, id, spender]),
    getErc20AllowanceQuery
  )
}
