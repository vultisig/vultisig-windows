import { useQuery } from '@tanstack/react-query'

import { getClaimableUtxos } from '../getClaimableUtxos'

type UseClaimableUtxosQueryInput = {
  btcAddress: string
}

/** Fetches claimable QBTC UTXOs for the given Bitcoin address. */
export const useClaimableUtxosQuery = ({
  btcAddress,
}: UseClaimableUtxosQueryInput) => {
  return useQuery({
    queryKey: ['qbtcClaimableUtxos', btcAddress],
    queryFn: () => getClaimableUtxos({ btcAddress }),
    enabled: btcAddress.length > 0,
  })
}
