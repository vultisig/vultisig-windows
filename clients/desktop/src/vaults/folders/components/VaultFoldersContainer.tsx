import { ChildrenProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'

import { TitledList } from '../../../lib/ui/list/TitledList'

export const VaultFoldersContainer: React.FC<ChildrenProp> = ({ children }) => {
  const { t } = useTranslation()

  return <TitledList title={t('folders')}>{children}</TitledList>
}
