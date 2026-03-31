import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useQuery } from '@tanstack/react-query'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'

import { useCurrentVaultAddress } from '../../../state/currentVaultCoins'
import { fetchUserValidName } from '../services/getUserValidThorchainName'

export const useUserValidThorchainNameQuery = () => {
  const address = useCurrentVaultAddress(chainFeeCoin.THORChain.chain)

  return useQuery({
    queryKey: ['user-valid-thorchain-name', address],
    queryFn: () => fetchUserValidName(address),
    retry: false,
    retryOnMount: false,
    staleTime: Infinity,
    ...noRefetchQueryOptions,
  })
}
