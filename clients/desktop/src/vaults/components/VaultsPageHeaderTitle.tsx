import { useAppNavigate } from '@lib/ui/navigation/hooks/useAppNavigate'
import { useTranslation } from 'react-i18next'

import { PageHeaderToggleTitle } from '../../ui/page/PageHeaderToggleTitle'

export const VaultsPageHeaderTitle = () => {
  const navigate = useAppNavigate()
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
