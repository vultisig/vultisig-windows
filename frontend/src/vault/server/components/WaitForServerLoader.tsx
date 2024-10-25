import { useTranslation } from 'react-i18next';

import { Text } from '../../../lib/ui/text';
import { PageContent } from '../../../ui/page/PageContent';
import { FancyLoader } from '../../../ui/pending/FancyLoader';

export const WaitForServerLoader = () => {
  const { t } = useTranslation();

  return (
    <PageContent alignItems="center" justifyContent="center">
      <FancyLoader />
      <Text color="contrast" weight="bold" size={16}>
        {t('looking_for_server')}
      </Text>
    </PageContent>
  );
};
