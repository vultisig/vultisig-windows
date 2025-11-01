import { EvmChain } from '@core/chain/Chain'
import { getEvmMaxPriorityFeePerGas } from '@core/chain/tx/fee/evm/maxPriorityFeePerGas'
import { useQuery } from '@tanstack/react-query'

export const useEvmMaxPriorityFeePerGasQuery = (chain: EvmChain) => {
  return useQuery({
    queryKey: ['evmMaxPriorityFeePerGas', chain],
    queryFn: () => getEvmMaxPriorityFeePerGas(chain),
  })
}
