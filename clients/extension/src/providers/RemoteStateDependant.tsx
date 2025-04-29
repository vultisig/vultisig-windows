import { useDefaultChainsQuery } from '@core/ui/chain/queries/useDefaultChainsQuery'
import { useFiatCurrencyQuery } from '@core/ui/preferences/queries/useFiatCurrencyQuery'
import {
  CurrentVaultIdProvider,
  useCurrentVaultIdQuery,
} from '@core/ui/vault/state/currentVaultId'
import { VaultsProvider } from '@core/ui/vault/state/vaults'
import { CenterAbsolutely } from '@lib/ui/layout/CenterAbsolutely'
import { ChildrenProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useMergeQueries } from '@lib/ui/query/hooks/useMergeQueries'
import { StrictText } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { useVaultsQuery } from '../vault/state/vaults'

export const RemoteStateDependant = ({ children }: ChildrenProp) => {
  const vaultsQuery = useVaultsQuery()
  const fiatCurrencyQuery = useFiatCurrencyQuery()
  const defaultChainsQuery = useDefaultChainsQuery()
  const currentVaultIdQuery = useCurrentVaultIdQuery()

  const query = useMergeQueries({
    vaults: vaultsQuery,
    fiatCurrency: fiatCurrencyQuery,
    defaultChains: defaultChainsQuery,
    currentVaultId: currentVaultIdQuery,
  })

  const { t } = useTranslation()

  return (
    <MatchQuery
      value={query}
      success={({ vaults, currentVaultId }) => (
        <VaultsProvider value={vaults.map(vault => ({ ...vault, coins: [] }))}>
          <CurrentVaultIdProvider value={currentVaultId}>
            {children}
          </CurrentVaultIdProvider>
        </VaultsProvider>
      )}
      error={() => (
        <CenterAbsolutely>
          <StrictText>{t('failed_to_load')}</StrictText>
        </CenterAbsolutely>
      )}
    />
  )
}
