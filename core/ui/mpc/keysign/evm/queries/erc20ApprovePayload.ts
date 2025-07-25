import { create } from '@bufbuild/protobuf'
import { EvmChain } from '@core/chain/Chain'
import { getErc20Allowance } from '@core/chain/chains/evm/erc20/getErc20Allowance'
import { AccountCoinKey } from '@core/chain/coin/AccountCoin'
import { Erc20ApprovePayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/erc20_approve_payload_pb'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { useQuery } from '@tanstack/react-query'

type Input = AccountCoinKey & {
  amount: bigint
  receiver: string
}

export const useErc20ApprovePayloadQuery = (input: Input) => {
  return useQuery({
    queryKey: ['erc20ApprovePayload', input],
    queryFn: async () => {
      const { chain, address, id, receiver, amount } = input

      if (isOneOf(chain, Object.values(EvmChain)) && id) {
        const allowance = await getErc20Allowance({
          chain,
          spender: receiver as `0x${string}`,
          address: address as `0x${string}`,
          id: id as `0x${string}`,
        })

        if (allowance < amount) {
          return create(Erc20ApprovePayloadSchema, {
            amount: amount.toString(),
            spender: receiver,
          })
        }
      }

      return null
    },
  })
}
