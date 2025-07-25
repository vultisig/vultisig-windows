import {
  getErc20Allowance,
  GetErc20AllowanceInput,
} from '@core/chain/chains/evm/erc20/getErc20Allowance'
import { useQuery } from '@tanstack/react-query'

export const useErc20Allowance = (input: GetErc20AllowanceInput) => {
  return useQuery({
    queryKey: ['erc20Allowance', input],
    queryFn: () => getErc20Allowance(input),
  })
}
