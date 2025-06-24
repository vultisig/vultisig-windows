import { EvmChain } from '@core/chain/Chain'
import { useEvmFeeQuery } from '@core/ui/mpc/keysign/tx/queries/useEvmFeeQuery'
import { useQuery } from '@tanstack/react-query'

type UseTxFeeQueryInput = {
  txHash: string
  chain: string // Accepts any chain type
}

export const useTxFeeQuery = (input: UseTxFeeQueryInput) => {
  const { txHash, chain } = input

  const evmFeeQuery = useEvmFeeQuery({ txHash, chain: chain as EvmChain })
  const fallbackQuery = useQuery({
    queryKey: ['txFee', input],
    queryFn: () => {
      throw new Error('Actual fee not supported for this chain')
    },
  })

  if (Object.values(EvmChain).includes(chain as EvmChain)) {
    return evmFeeQuery
  }
  return fallbackQuery
}
