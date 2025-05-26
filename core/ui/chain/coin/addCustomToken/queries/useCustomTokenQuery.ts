import { ChainAccount } from '@core/chain/ChainAccount'
import { useQuery } from '@tanstack/react-query'

import { CustomTokenEnabledChain } from '../core/chains'
import { getCustomToken } from '../core/getCustomToken'

export const useCustomTokenQuery = (
  input: ChainAccount<CustomTokenEnabledChain>
) => {
  return useQuery({
    queryKey: ['customToken', input],
    queryFn: () => getCustomToken(input),
  })
}
