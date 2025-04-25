import { FiatCurrencyProvider } from '@core/ui/state/fiatCurrency'
import { VaultsProvider } from '@core/ui/vault/state/vaults'
import { CenterAbsolutely } from '@lib/ui/layout/CenterAbsolutely'
import { ChildrenProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useMergeQueries } from '@lib/ui/query/hooks/useMergeQueries'
import { StrictText } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { useFiatCurrencyQuery } from '../preferences/fiatCurrency'
import { CurrentVaultIdProvider } from '../vault/state/currentVaultId'
import { useVaultsQuery } from '../vault/state/vaults'

export const RemoteStateDependant = ({ children }: ChildrenProp) => {
  const vaultsQuery = useVaultsQuery()
  const fiatCurrencyQuery = useFiatCurrencyQuery()

  const query = useMergeQueries({
    vaults: vaultsQuery,
    fiatCurrency: fiatCurrencyQuery,
  })

  const { t } = useTranslation()

  return (
    <MatchQuery
      value={query}
      success={({ vaults, fiatCurrency }) => (
        <FiatCurrencyProvider value={fiatCurrency}>
          <VaultsProvider
            value={vaults.map(vault => ({ ...vault, coins: [] }))}
          >
            <CurrentVaultIdProvider>{children}</CurrentVaultIdProvider>
          </VaultsProvider>
        </FiatCurrencyProvider>
      )}
      error={() => (
        <CenterAbsolutely>
          <StrictText>{t('failed_to_load')}</StrictText>
        </CenterAbsolutely>
      )}
    />
  )
}
