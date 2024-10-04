import { useTranslation } from 'react-i18next';

import { Button } from '../../../../lib/ui/buttons/Button';
import { VStack } from '../../../../lib/ui/layout/Stack';
import { ComponentWithForwardActionProps } from '../../../../lib/ui/props';
import { PageContent } from '../../../../ui/page/PageContent';
import { PageHeader } from '../../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../../ui/page/PageHeaderTitle';
import { WithProgressIndicator } from '../../shared/WithProgressIndicator';
import { KeysignTxOverview } from './KeysignTxOverview';

export const JoinKeysignVerifyStep = ({
  onForward,
}: ComponentWithForwardActionProps) => {
  const { t } = useTranslation();

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={<PageHeaderTitle>{t('verify')}</PageHeaderTitle>}
      />
      <PageContent>
        <VStack flexGrow>
          <WithProgressIndicator value={0.6}>
            <KeysignTxOverview />
          </WithProgressIndicator>
        </VStack>
        <Button onClick={onForward}>{t('join_keysign')}</Button>
      </PageContent>
    </>
  );
};
