import { useTranslation } from 'react-i18next';

import { Button } from '../../lib/ui/buttons/Button';
import { getFormProps } from '../../lib/ui/form/utils/getFormProps';
import { VStack } from '../../lib/ui/layout/Stack';
import { PageContent } from '../../ui/page/PageContent';
import { ManageAmount } from './amount/ManageSendAmount';
import { ManageSendCoin } from './coin/ManageSendCoin';
import { ManageReceiver } from './receiver/ManageReceiver';
import { Sender } from './sender/Sender';

export const SendForm = () => {
  const { t } = useTranslation();

  return (
    <PageContent
      as="form"
      gap={40}
      {...getFormProps({
        onSubmit: () => {
          console.log('submit!');
        },
      })}
    >
      <VStack flexGrow gap={16}>
        <ManageSendCoin />
        <Sender />
        <ManageReceiver />
        <ManageAmount />
      </VStack>
      <Button type="submit">{t('continue')}</Button>
    </PageContent>
  );
};
