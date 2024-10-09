import { useTranslation } from 'react-i18next';

import { Button } from '../../../lib/ui/buttons/Button';
import { getFormProps } from '../../../lib/ui/form/utils/getFormProps';
import { VStack } from '../../../lib/ui/layout/Stack';
import { ComponentWithForwardActionProps } from '../../../lib/ui/props';
import { PageContent } from '../../../ui/page/PageContent';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { WithProgressIndicator } from '../../keysign/shared/WithProgressIndicator';
import { ManageAmount } from '../amount/ManageSendAmount';
import { ManageSendCoin } from '../coin/ManageSendCoin';
import { SendNetworkFee } from '../fee/SendNetworkFee';
import { ManageReceiver } from '../receiver/ManageReceiver';
import { Sender } from '../sender/Sender';
import { useIsSendFormDisabled } from './hooks/useIsSendFormDisabled';

export const SendForm = ({ onForward }: ComponentWithForwardActionProps) => {
  const { t } = useTranslation();

  const isDisabled = useIsSendFormDisabled();

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={<PageHeaderTitle>{t('send')}</PageHeaderTitle>}
      />
      <PageContent
        as="form"
        gap={40}
        {...getFormProps({
          onSubmit: onForward,
          isDisabled,
        })}
      >
        <WithProgressIndicator value={0.2}>
          <VStack gap={16}>
            <ManageSendCoin />
            <Sender />
            <ManageReceiver />
            <ManageAmount />
            <SendNetworkFee />
          </VStack>
        </WithProgressIndicator>
        <Button isDisabled={isDisabled} type="submit">
          {t('continue')}
        </Button>
      </PageContent>
    </>
  );
};
