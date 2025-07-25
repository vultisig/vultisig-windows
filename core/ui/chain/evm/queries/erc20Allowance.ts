import {
  getErc20Allowance,
  GetErc20AllowanceInput,
} from '@core/chain/chains/evm/erc20/getErc20Allowance'
import { useQuery } from '@tanstack/react-query'

export const getErc20AllowanceQuery = (input: GetErc20AllowanceInput) => ({
  queryKey: ['erc20Allowance', input],
  queryFn: () => getErc20Allowance(input),
})

export const useErc20Allowance = (input: GetErc20AllowanceInput) => {
  return useQuery(getErc20AllowanceQuery(input))
}
