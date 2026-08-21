import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Chain } from '@vultisig/core-chain/Chain'

import { DefiPositionErrorState } from '../../../tabs/DefiPositionErrorState'
import { KaminoMissingAddress } from '../KaminoMissingAddress'
import { useKaminoPositionsQuery } from '../queries/useKaminoPositionsQuery'
import { useKaminoVaultsQuery } from '../queries/useKaminoVaultsQuery'
import { KaminoWithdrawFlow } from './KaminoWithdrawFlow'

const Pending = () => (
  <VStack flexGrow alignItems="center" justifyContent="center">
    <Spinner size={24} />
  </VStack>
)

/**
 * Withdraw flow for one curated Kamino vault.
 *
 * The vault and the position are both re-read here rather than carried in
 * navigation state: the share rate and the staked/unstaked split decide how
 * much can be withdrawn and which transaction shape the API will build, and a
 * figure captured when the card rendered could already be stale.
 *
 * The position is required, not optional — there is nothing to withdraw from a
 * vault whose balance could not be read, and guessing one is how a partial
 * withdrawal turns into a full exit.
 */
export const KaminoWithdrawPage = () => {
  const [{ vaultAddress }] = useCoreViewState<'kaminoWithdraw'>()
  const owner = useCurrentVaultAddress(Chain.Solana)
  const vaultsQuery = useKaminoVaultsQuery()
  const positionsQuery = useKaminoPositionsQuery(owner)

  // A vault with no Solana address has nothing to act on, and the position
  // read is disabled without one — so it would otherwise sit on a spinner
  // that never resolves.
  if (!owner) {
    return <KaminoMissingAddress />
  }

  return (
    <MatchQuery
      value={vaultsQuery}
      pending={Pending}
      error={() => <DefiPositionErrorState onRetry={vaultsQuery.refetch} />}
      success={vaults => {
        const vault = vaults.find(
          ({ descriptor }) => descriptor.address === vaultAddress
        )
        if (!vault) {
          return <DefiPositionErrorState onRetry={vaultsQuery.refetch} />
        }

        return (
          <MatchQuery
            value={positionsQuery}
            pending={Pending}
            error={() => (
              <DefiPositionErrorState onRetry={positionsQuery.refetch} />
            )}
            success={positions => {
              const position = positions[vaultAddress]?.shares
              if (!position) {
                return (
                  <DefiPositionErrorState onRetry={positionsQuery.refetch} />
                )
              }

              return (
                <KaminoWithdrawFlow
                  vault={vault}
                  position={position}
                  owner={owner}
                />
              )
            }}
          />
        )
      }}
    />
  )
}
