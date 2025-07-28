import { create } from '@bufbuild/protobuf'
import { EvmChain } from '@core/chain/Chain'
import { AccountCoinKey } from '@core/chain/coin/AccountCoin'
import { Erc20ApprovePayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/erc20_approve_payload_pb'
import { usePotentialQuery } from '@lib/ui/query/hooks/usePotentialQuery'
import { useTransformQueryData } from '@lib/ui/query/hooks/useTransformQueryData'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { useCallback, useMemo } from 'react'

import { getErc20AllowanceQuery } from '../../../../chain/evm/queries/erc20Allowance'

type Input = AccountCoinKey & {
  amount: bigint
  spender: string
}

export const useErc20ApprovePayloadQuery = (input: Input) => {
  const { chain, address, id, spender, amount } = input

  return useTransformQueryData(
    usePotentialQuery(
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
      getErc20AllowanceQuery,
      null
    ),
    useCallback(
      allowance => {
        if (allowance !== null && allowance < amount) {
          return create(Erc20ApprovePayloadSchema, {
            amount: amount.toString(),
            spender,
          })
        }

        return null
      },
      [amount, spender]
    )
  )
}
