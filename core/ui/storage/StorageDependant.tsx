import { ProductLogoBlock } from '@core/ui/product/ProductLogoBlock'
import { FlowErrorPageContent } from '@lib/ui/flow/FlowErrorPageContent'
import { NavigationProvider } from '@lib/ui/navigation/state'
import { ChildrenProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useMergeQueries } from '@lib/ui/query/hooks/useMergeQueries'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'

import { RootErrorBoundary } from '../errors/RootErrorBoundary'
import { I18nProvider } from '../i18n/I18nProvider'
import { RootCurrentVaultProvider } from '../vault/state/currentVault'
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
  const vaults = useVaultsQuery()
  const vaultFolders = useVaultFoldersQuery()
  const defaultChains = useDefaultChainsQuery()
  const fiatCurrency = useFiatCurrencyQuery()
  const currentVaultId = useCurrentVaultIdQuery()
  const addressBookItems = useAddressBookItemsQuery()
  const language = useLanguageQuery()
  const isVaultBalanceVisible = useIsVaultBalanceVisibleQuery()
  const hasFinishedOnboarding = useHasFinishedOnboardingQuery()
  const initialView = useInitialViewQuery()
  const coinFinderIgnore = useCoinFinderIgnoreQuery()

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
    initialView,
    coinFinderIgnore,
  })

  return (
    <MatchQuery
      value={query}
      success={({ currentVaultId, vaults, initialView }) => (
        <I18nProvider>
          <NavigationProvider initialValue={{ history: [initialView] }}>
            <RootErrorBoundary>
              <VaultsProvider value={vaults}>
                <CurrentVaultIdProvider value={currentVaultId}>
                  <RootCurrentVaultProvider>
                    {children}
                  </RootCurrentVaultProvider>
                </CurrentVaultIdProvider>
              </VaultsProvider>
            </RootErrorBoundary>
          </NavigationProvider>
        </I18nProvider>
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
