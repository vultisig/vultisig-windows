import { ProductLogoBlock } from '@core/ui/product/ProductLogoBlock'
import { FlowErrorPageContent } from '@lib/ui/flow/FlowErrorPageContent'
import { ChildrenProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useMergeQueries } from '@lib/ui/query/hooks/useMergeQueries'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'

import { useAddressBookItemsQuery } from './addressBook'
import {
  CurrentVaultIdProvider,
  useCurrentVaultIdQuery,
} from './currentVaultId'
import { useDefaultChainsQuery } from './defaultChains'
import { useFiatCurrencyQuery } from './fiatCurrency'
import { useIsVaultBalanceVisibleQuery } from './isVaultBalanceVisible'
import { useLanguageQuery } from './language'
import { useHasFinishedOnboardingQuery } from './onboarding'
import { useVaultFoldersQuery } from './vaultFolders'
import { useVaultsQuery } from './vaults'

export const StorageDependant = ({ children }: ChildrenProp) => {
  const vaults = useVaultsQuery()
  const vaultFolders = useVaultFoldersQuery()
  const defaultChains = useDefaultChainsQuery()
  const fiatCurrency = useFiatCurrencyQuery()
  const currentVaultId = useCurrentVaultIdQuery()
  const addressBookItems = useAddressBookItemsQuery()
  const language = useLanguageQuery()
  const isVaultBalanceVisible = useIsVaultBalanceVisibleQuery()
  const hasFinishedOnboarding = useHasFinishedOnboardingQuery()

  const query = useMergeQueries({
    vaults,
    vaultFolders,
    defaultChains,
    fiatCurrency,
    currentVaultId,
    addressBookItems,
    language,
    isVaultBalanceVisible,
    hasFinishedOnboarding,
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
