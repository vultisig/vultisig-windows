import { useTranslation } from 'react-i18next';

import { PageHeader } from '../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../ui/page/PageHeaderTitle';
import { SendForm } from './SendForm';
import { SendAmountProvider } from './state/amount';
import { SendReceiverProvider } from './state/receiver';

export const SendPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={<PageHeaderTitle>{t('send')}</PageHeaderTitle>}
      />
      <SendAmountProvider initialValue={null}>
        <SendReceiverProvider initialValue="">
          <SendForm />
        </SendReceiverProvider>
      </SendAmountProvider>
    </>
  );
};
