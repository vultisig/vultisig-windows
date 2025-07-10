import { Chain } from '@core/chain/Chain'
import { isBlockaidEnabled } from '@core/config/featureFlags'
import { blockaid } from '@core/config/security/blockaid'
import { useQuery } from '@tanstack/react-query'

type Props = {
  chain: Chain | string
  address: string
}

export const useBlockaidAddressScan = ({ chain, address }: Props) => {
  return useQuery({
    queryKey: ['blockaidAddress', chain, address],
    enabled: isBlockaidEnabled() && !!address,
    queryFn: () => blockaid.scanAddress({ chain, address }),
    staleTime: 1000 * 60 * 5,
  })
}
