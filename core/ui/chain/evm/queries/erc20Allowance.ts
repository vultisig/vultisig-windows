import {
  getErc20Allowance,
  GetErc20AllowanceInput,
} from '@core/chain/chains/evm/erc20/getErc20Allowance'

export const getErc20AllowanceQuery = (input: GetErc20AllowanceInput) => ({
  queryKey: ['erc20Allowance', input],
  queryFn: () => getErc20Allowance(input),
})
