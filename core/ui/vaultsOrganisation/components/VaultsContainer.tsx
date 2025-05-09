import { TitledList } from '@lib/list/TitledList'
import { TitleProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'

export const VaultsContainer: React.FC<Omit<TitleProp, 'title'>> = props => {
  const { t } = useTranslation()

  return <TitledList title={t('vaults')} {...props} />
}
