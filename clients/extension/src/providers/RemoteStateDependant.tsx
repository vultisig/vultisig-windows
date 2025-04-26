import { VaultsProvider } from '@core/ui/vault/state/vaults'
import { CenterAbsolutely } from '@lib/ui/layout/CenterAbsolutely'
import { ChildrenProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { StrictText } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { useVaultsQuery } from '../vault/queries/useVaultsQuery'

export const RemoteStateDependant = ({ children }: ChildrenProp) => {
  const vaultsQuery = useVaultsQuery()
  const { t } = useTranslation()
  console.log('vaults query', vaultsQuery)

  return (
    <MatchQuery
      value={vaultsQuery}
      success={vaults => {
        return <VaultsProvider value={vaults}>{children}</VaultsProvider>
      }}
      error={() => (
        <CenterAbsolutely>
          <StrictText>{t('failed_to_load')}</StrictText>
        </CenterAbsolutely>
      )}
    />
  )
}
