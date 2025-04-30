import { useDefaultChainsQuery } from '@core/ui/chain/queries/useDefaultChainsQuery'
import { useFiatCurrencyQuery } from '@core/ui/preferences/queries/useFiatCurrencyQuery'
import { ProductLogoBlock } from '@core/ui/product/ProductLogoBlock'
import {
  CurrentVaultIdProvider,
  useCurrentVaultIdQuery,
} from '@core/ui/vault/state/currentVaultId'
import { FlowErrorPageContent } from '@lib/ui/flow/FlowErrorPageContent'
import { ChildrenProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useMergeQueries } from '@lib/ui/query/hooks/useMergeQueries'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'

import { useVaultFoldersQuery } from './vaultFolders'
import { useVaultsQuery } from './vaults'

export const StorageDependant = ({ children }: ChildrenProp) => {
  const vaults = useVaultsQuery()
  const vaultFolders = useVaultFoldersQuery()
  const defaultChains = useDefaultChainsQuery()
  const fiatCurrencyQuery = useFiatCurrencyQuery()
  const currentVaultId = useCurrentVaultIdQuery()

  const query = useMergeQueries({
    vaults,
    vaultFolders,
    defaultChains,
    fiatCurrency: fiatCurrencyQuery,
    currentVaultId,
  })

  return (
    <MatchQuery
      value={query}
      success={({ currentVaultId }) => (
        <CurrentVaultIdProvider value={currentVaultId}>
          {children}
        </CurrentVaultIdProvider>
      )}
      error={error => (
        <FlowErrorPageContent
          title="Failed to load essential data from the storage"
          message={extractErrorMsg(error)}
        />
      )}
      pending={() => <ProductLogoBlock />}
    />
  )
}
