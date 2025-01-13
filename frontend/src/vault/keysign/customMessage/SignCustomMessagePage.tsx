import { useTranslation } from 'react-i18next';

import { Button } from '../../../lib/ui/buttons/Button';
import { FlowPageHeader } from '../../../ui/flow/FlowPageHeader';
import { PageContent } from '../../../ui/page/PageContent';

export const SignCustomMessagePage = () => {
  const { t } = useTranslation();

  return (
    <>
      <FlowPageHeader title={t('sign_message')} />
      <PageContent>
        <div>SignCustomMessagePage</div>
        <Button>{t('sign')}</Button>
      </PageContent>
    </>
  );
};
