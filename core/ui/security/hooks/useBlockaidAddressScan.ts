import { Chain } from '@core/chain/Chain'
import { blockaid } from '@core/config/security/blockaid/blockaid'
import { useBlockaidEnabled } from '@core/ui/storage/blockaid'
import { useQuery } from '@tanstack/react-query'

type Props = {
  chain: Chain
  address: string
}

export const useBlockaidAddressScan = ({ chain, address }: Props) => {
  const blockaidEnabled = useBlockaidEnabled()

  return useQuery({
    queryKey: ['blockaidAddress', chain, address],
    enabled: blockaidEnabled && !!address,
    queryFn: () => blockaid.scanAddress({ chain, address }),
    staleTime: 1000 * 60 * 5,
  })
}
