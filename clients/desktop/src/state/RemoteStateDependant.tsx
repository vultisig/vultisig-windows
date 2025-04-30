import { useDefaultChainsQuery } from '@core/ui/chain/queries/useDefaultChainsQuery'
import { useFiatCurrencyQuery } from '@core/ui/preferences/queries/useFiatCurrencyQuery'
import { ProductLogoBlock } from '@core/ui/product/ProductLogoBlock'
import {
  CurrentVaultIdProvider,
  useCurrentVaultIdQuery,
} from '@core/ui/vault/state/currentVaultId'
import { VaultsProvider } from '@core/ui/vault/state/vaults'
import { ChildrenProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useMergeQueries } from '@lib/ui/query/hooks/useMergeQueries'
import { StrictText } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { Center } from '../lib/ui/layout/Center'
import { useVaultsQuery } from '../vault/queries/useVaultsQuery'
import { useVaultFoldersQuery } from '../vaults/folders/queries/useVaultFoldersQuery'

export const RemoteStateDependant = ({ children }: ChildrenProp) => {
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

  const { t } = useTranslation()

  return (
    <MatchQuery
      value={query}
      success={({ vaults, currentVaultId }) => (
        <VaultsProvider value={vaults}>
          <CurrentVaultIdProvider value={currentVaultId}>
            {children}
          </CurrentVaultIdProvider>
        </VaultsProvider>
      )}
      error={() => (
        <Center>
          <StrictText>{t('failed_to_load')}</StrictText>
        </Center>
      )}
      pending={() => <ProductLogoBlock />}
    />
  )
}
