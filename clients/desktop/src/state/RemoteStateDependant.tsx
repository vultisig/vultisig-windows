import { VaultsProvider } from '@core/ui/vault/state/vaults'
import { ChildrenProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useMergeQueries } from '@lib/ui/query/hooks/useMergeQueries'
import { StrictText } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { Center } from '../lib/ui/layout/Center'
import { ProductLogoBlock } from '../ui/logo/ProductLogoBlock'
import { useVaultsQuery } from '../vault/queries/useVaultsQuery'
import { useVaultFoldersQuery } from '../vaults/folders/queries/useVaultFoldersQuery'

export const RemoteStateDependant = ({ children }: ChildrenProp) => {
  const vaults = useVaultsQuery()
  const vaultFolders = useVaultFoldersQuery()

  const query = useMergeQueries({
    vaults,
    vaultFolders,
  })

  const { t } = useTranslation()

  return (
    <MatchQuery
      value={query}
      success={({ vaults }) => (
        <VaultsProvider value={vaults}>{children}</VaultsProvider>
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
