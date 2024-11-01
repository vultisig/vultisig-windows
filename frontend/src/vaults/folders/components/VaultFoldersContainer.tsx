import { useTranslation } from 'react-i18next';

import { TitledList } from '../../../lib/ui/list/TitledList';
import { ComponentWithChildrenProps } from '../../../lib/ui/props';

export const VaultFoldersContainer: React.FC<ComponentWithChildrenProps> = ({
  children,
}) => {
  const { t } = useTranslation();

  return <TitledList title={t('folders')}>{children}</TitledList>;
};
