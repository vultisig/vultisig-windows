import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useTranslation } from 'react-i18next'

import { PageHeaderToggleTitle } from '../../ui/page/PageHeaderToggleTitle'

export const VaultsPageHeaderTitle = () => {
  const navigate = useCoreNavigate()
  const { t } = useTranslation()

  return (
    <PageHeaderToggleTitle
      value={true}
      onChange={() => {
        navigate('vault')
      }}
    >
      {t('vaults')}
    </PageHeaderToggleTitle>
  )
}
