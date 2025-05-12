import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { PageHeaderToggleTitle } from '@lib/ui/page/PageHeaderToggleTitle'
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
