import { useQuery } from '@tanstack/react-query'
import { getClaimableUtxos } from '@vultisig/core-chain/chains/cosmos/qbtc/claim/getClaimableUtxos'

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
