import { EvmChain } from '@core/chain/Chain'
import { getEvmBaseFee } from '@core/chain/tx/fee/evm/getEvmBaseFee'
import { useQuery } from '@tanstack/react-query'

export const useEvmBaseFeeQuery = (chain: EvmChain) => {
  return useQuery({
    queryKey: ['evmBaseFee', chain],
    queryFn: () => getEvmBaseFee(chain),
  })
}
