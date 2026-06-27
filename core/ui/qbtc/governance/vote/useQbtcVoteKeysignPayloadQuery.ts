import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useQuery } from '@tanstack/react-query'
import { QbtcVoteSelection } from '@vultisig/core-chain/chains/cosmos/qbtc/governance/proposal'
import { KeysignMessagePayload } from '@vultisig/core-mpc/keysign/keysignPayload/KeysignMessagePayload'

import { buildQbtcVoteKeysignPayload } from './buildVoteKeysignPayload'

type UseQbtcVoteKeysignPayloadQueryInput = {
  voterAddress: string
  proposalId: string
  selection: QbtcVoteSelection
}

/**
 * Builds (and caches) the keysign payload for a QBTC governance vote. The build
 * is async because it fetches the voter's account number / sequence from the
 * QBTC REST node; the result feeds {@link StartKeysignPrompt}.
 */
export const useQbtcVoteKeysignPayloadQuery = ({
  voterAddress,
  proposalId,
  selection,
}: UseQbtcVoteKeysignPayloadQueryInput) => {
  const vault = useCurrentVault()
  const walletCore = useAssertWalletCore()

  return useQuery<KeysignMessagePayload>({
    queryKey: ['qbtcVoteKeysignPayload', proposalId, selection] as const,
    queryFn: () =>
      buildQbtcVoteKeysignPayload({
        vault,
        voterAddress,
        proposalId,
        selection,
        walletCore,
      }),
    ...noRefetchQueryOptions,
  })
}
