import { ProductLogoBlock } from '@core/ui/product/ProductLogoBlock'
import { FlowErrorPageContent } from '@lib/ui/flow/FlowErrorPageContent'
import { NavigationProvider } from '@lib/ui/navigation/state'
import { ChildrenProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useMergeQueries } from '@lib/ui/query/hooks/useMergeQueries'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'

import { RootErrorBoundary } from '../errors/RootErrorBoundary'
import { I18nProvider } from '../i18n/I18nProvider'
import { useAddressBookItemsQuery } from './addressBook'
import { useCoinFinderIgnoreQuery } from './coinFinderIgnore'
import {
  CurrentVaultIdProvider,
  useCurrentVaultIdQuery,
} from './currentVaultId'
import { useDefaultChainsQuery } from './defaultChains'
import { useFiatCurrencyQuery } from './fiatCurrency'
import { useInitialViewQuery } from './initialView'
import { useIsVaultBalanceVisibleQuery } from './isVaultBalanceVisible'
import { useLanguageQuery } from './language'
import { useHasFinishedOnboardingQuery } from './onboarding'
import { useVaultFoldersQuery } from './vaultFolders'
import { useVaultsQuery, VaultsProvider } from './vaults'

export const StorageDependant = ({ children }: ChildrenProp) => {
  const { data: vaultsData = [] } = useVaultsQuery()
  const { data: currentVaultId = null } = useCurrentVaultIdQuery()
  const baseQueries = useMergeQueries({
    vaultFolders: useVaultFoldersQuery(),
    defaultChains: useDefaultChainsQuery(),
    fiatCurrency: useFiatCurrencyQuery(),
    addressBookItems: useAddressBookItemsQuery(),
    language: useLanguageQuery(),
    isVaultBalanceVisible: useIsVaultBalanceVisibleQuery(),
    hasFinishedOnboarding: useHasFinishedOnboardingQuery(),
    initialView: useInitialViewQuery(),
    coinFinderIgnore: useCoinFinderIgnoreQuery(),
  })

  return (
    <MatchQuery
      value={baseQueries}
      pending={() => <ProductLogoBlock />}
      error={error => (
        <FlowErrorPageContent
          title="Failed to load essential data from the storage"
          message={extractErrorMsg(error)}
        />
      )}
      success={({ initialView }) => (
        <I18nProvider>
          <NavigationProvider initialValue={{ history: [initialView] }}>
            <RootErrorBoundary>
              <VaultsProvider value={vaultsData}>
                <CurrentVaultIdProvider value={currentVaultId}>
                  {children}
                </CurrentVaultIdProvider>
              </VaultsProvider>
            </RootErrorBoundary>
          </NavigationProvider>
        </I18nProvider>
      )}
    />
  )
}
