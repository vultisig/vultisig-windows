import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Chain } from '@vultisig/core-chain/Chain'

import { DefiPositionErrorState } from '../../../tabs/DefiPositionErrorState'
import { useKaminoVaultsQuery } from '../queries/useKaminoVaultsQuery'
import { KaminoDepositFlow } from './KaminoDepositFlow'

/**
 * Deposit flow for one curated Kamino vault: amount entry, then the review
 * step that starts the keysign.
 *
 * The vault is re-resolved from the hydration query rather than carried in
 * navigation state, so the minimum and the share rate the form bounds against
 * are the live ones — and an address the registry no longer carries has no
 * vault to deposit into rather than a stale one.
 */
export const KaminoDepositPage = () => {
  const [{ vaultAddress }] = useCoreViewState<'kaminoDeposit'>()
  const owner = useCurrentVaultAddress(Chain.Solana)
  const vaultsQuery = useKaminoVaultsQuery()

  return (
    <MatchQuery
      value={vaultsQuery}
      pending={() => (
        <VStack flexGrow alignItems="center" justifyContent="center">
          <Spinner size={24} />
        </VStack>
      )}
      error={() => <DefiPositionErrorState onRetry={vaultsQuery.refetch} />}
      success={vaults => {
        const vault = vaults.find(
          ({ descriptor }) => descriptor.address === vaultAddress
        )

        if (!vault) {
          return <DefiPositionErrorState onRetry={vaultsQuery.refetch} />
        }

        return <KaminoDepositFlow vault={vault} owner={owner} />
      }}
    />
  )
}
