import { useTranslation } from 'react-i18next';

import { TitledComponentProps } from '../../../lib/ui/props';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { KeygenEducationPrompt } from './KeygenEducationPrompt';

export const KeygenPageHeader = ({ title }: Partial<TitledComponentProps>) => {
  const { t } = useTranslation();

  return (
    <PageHeader
      primaryControls={<PageHeaderBackButton />}
      title={<PageHeaderTitle>{title ?? t('keygen')}</PageHeaderTitle>}
      secondaryControls={<KeygenEducationPrompt />}
    />
  );
};
