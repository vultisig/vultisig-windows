import { UtxoChain } from '@core/chain/Chain'
import { getUtxoByteFee } from '@core/chain/chains/utxo/fee/byteFee'
import { useQuery } from '@tanstack/react-query'

export const useUtxoByteFeeQuery = (chain: UtxoChain) => {
  return useQuery({
    queryKey: ['utxoByteFee', chain],
    queryFn: () => getUtxoByteFee(chain),
  })
}
