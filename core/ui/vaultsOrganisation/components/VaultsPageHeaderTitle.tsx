import { PageHeaderToggleTitle } from '@core/ui/page/PageHeaderToggleTitle'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useTranslation } from 'react-i18next'


export const VaultsPageHeaderTitle = () => {
  const navigate = useCoreNavigate()
  const { t } = useTranslation()

  return (
    <PageHeaderToggleTitle
      value={true}
      onChange={() => {
        navigate({ id: 'vault' })
      }}
    >
      {t('vaults')}
    </PageHeaderToggleTitle>
  )
}
