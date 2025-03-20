import { TitleProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'

import { TitledList } from '../../lib/ui/list/TitledList'

export const VaultsContainer: React.FC<Omit<TitleProp, 'title'>> = props => {
  const { t } = useTranslation()

  return <TitledList title={t('vaults')} {...props} />
}
