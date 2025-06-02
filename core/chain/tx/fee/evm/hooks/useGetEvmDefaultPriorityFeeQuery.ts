import { useQuery } from '@tanstack/react-query'

import { EvmChain } from '../../../../Chain'
import { getEvmDefaultPriorityFee } from '../getEvmDefaultPriorityFee'

export const useGetEvmDefaultPriorityFeeQuery = ({
  chain,
}: {
  chain: EvmChain
}) => {
  return useQuery({
    queryKey: ['evmDefaultPriorityFee'],
    queryFn: async () => await getEvmDefaultPriorityFee(chain),
  })
}
