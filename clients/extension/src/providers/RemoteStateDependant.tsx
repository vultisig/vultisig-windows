import { VaultsProvider } from '@core/ui/vault/state/vaults'
import { CenterAbsolutely } from '@lib/ui/layout/CenterAbsolutely'
import { ChildrenProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { StrictText } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { useVaultsQuery } from '../vault/state/vaults'

export const RemoteStateDependant = ({ children }: ChildrenProp) => {
  const vaultsQuery = useVaultsQuery()
  const { t } = useTranslation()

  return (
    <MatchQuery
      value={vaultsQuery}
      success={vaults => (
        // TODO: fix this when coins are added
        <VaultsProvider value={vaults.map(vault => ({ ...vault, coins: [] }))}>
          {children}
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
