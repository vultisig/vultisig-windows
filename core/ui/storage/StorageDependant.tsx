import { ProductLogoBlock } from '@core/ui/product/ProductLogoBlock'
import { ErrorBoundary } from '@lib/ui/errors/ErrorBoundary'
import { ChildrenProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useMergeQueries } from '@lib/ui/query/hooks/useMergeQueries'

import { RootErrorFallback } from '../errors/RootErrorFallback'
import { FlowErrorPageContent } from '../flow/FlowErrorPageContent'
import { I18nProvider } from '../i18n/I18nProvider'
import { PasscodeProvider } from '../passcodeEncryption/state/passcode'
import { useCore } from '../state/core'
import { RootCurrentVaultProvider } from '../vault/state/currentVault'
import { useAddressBookItemsQuery } from './addressBook'
import { useIsBalanceVisibleQuery } from './balanceVisibility'
import { useIsBlockaidEnabledQuery } from './blockaid'
import { useCoinFinderIgnoreQuery } from './coinFinderIgnore'
import {
  CurrentVaultIdProvider,
  useCurrentVaultIdQuery,
} from './currentVaultId'
import { useDefaultChainsQuery } from './defaultChains'
import { useFiatCurrencyQuery } from './fiatCurrency'
import { useLanguageQuery } from './language'
import { useHasFinishedOnboardingQuery } from './onboarding'
import { usePasscodeAutoLockQuery } from './passcodeAutoLock'
import { usePasscodeEncryptionQuery } from './passcodeEncryption'
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
  const isBalanceVisible = useIsBalanceVisibleQuery()
  const hasFinishedOnboarding = useHasFinishedOnboardingQuery()
  const coinFinderIgnore = useCoinFinderIgnoreQuery()
  const passcodeEncryption = usePasscodeEncryptionQuery()
  const passcodeAutoLock = usePasscodeAutoLockQuery()
  const isBlockaidEnabled = useIsBlockaidEnabledQuery()

  const { processError } = useCore()

  const query = useMergeQueries({
    vaults,
    vaultFolders,
    defaultChains,
    fiatCurrency,
    currentVaultId,
    addressBookItems,
    language,
    isBalanceVisible,
    hasFinishedOnboarding,
    coinFinderIgnore,
    passcodeEncryption,
    passcodeAutoLock,
    isBlockaidEnabled,
  })

  return (
    <MatchQuery
      value={query}
      success={({ currentVaultId, vaults }) => (
        <I18nProvider>
          <ErrorBoundary
            fallback={RootErrorFallback}
            processError={processError}
          >
            <VaultsProvider value={vaults}>
              <CurrentVaultIdProvider value={currentVaultId}>
                <PasscodeProvider initialValue={null}>
                  <RootCurrentVaultProvider>
                    {children}
                  </RootCurrentVaultProvider>
                </PasscodeProvider>
              </CurrentVaultIdProvider>
            </VaultsProvider>
          </ErrorBoundary>
        </I18nProvider>
      )}
      error={error => (
        <FlowErrorPageContent
          title="Failed to load essential data from the storage"
          error={error}
        />
      )}
      pending={() => <ProductLogoBlock />}
    />
  )
}
