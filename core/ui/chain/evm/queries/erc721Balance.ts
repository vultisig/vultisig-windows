import {
  getErc721Balance,
  GetErc721BalanceInput,
} from '@core/chain/chains/evm/erc721/getErc721Balance'
import { useQuery } from '@tanstack/react-query'

export const useErc721BalanceQuery = (input: GetErc721BalanceInput) => {
  return useQuery({
    queryKey: ['erc721Balance', input],
    queryFn: () => getErc721Balance(input),
  })
}
