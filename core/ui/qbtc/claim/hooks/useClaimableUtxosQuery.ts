import { useQuery } from '@tanstack/react-query'
import { getClaimableUtxos } from '@vultisig/core-chain/chains/cosmos/qbtc/claim/getClaimableUtxos'

type ClaimableUtxosQueryKeyInput = {
  btcAddress: string
}

export const getClaimableUtxosQueryKey = ({
  btcAddress,
}: ClaimableUtxosQueryKeyInput) => ['qbtcClaimableUtxos', btcAddress] as const

type UseClaimableUtxosQueryInput = {
  btcAddress: string
}

/** Fetches claimable QBTC UTXOs for the given Bitcoin address. */
export const useClaimableUtxosQuery = ({
  btcAddress,
}: UseClaimableUtxosQueryInput) => {
  return useQuery({
    queryKey: getClaimableUtxosQueryKey({ btcAddress }),
    queryFn: () => getClaimableUtxos({ btcAddress }),
    enabled: btcAddress.length > 0,
  })
}
