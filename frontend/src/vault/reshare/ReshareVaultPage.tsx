import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { Button } from '../../lib/ui/buttons/Button';
import { VStack } from '../../lib/ui/layout/Stack';
import { InfoBlock } from '../../lib/ui/status/InfoBlock';
import { Text } from '../../lib/ui/text';
import { makeAppPath } from '../../navigation';
import { PageContent } from '../../ui/page/PageContent';
import { PageHeader } from '../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../ui/page/PageHeaderTitle';

export const ReshareVaultPage = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={<PageHeaderTitle>{t('reshare')}</PageHeaderTitle>}
      />
      <PageContent>
        <VStack gap={8} flexGrow alignItems="center" justifyContent="center">
          <Text size={20} color="contrast" weight="600">
            {t('reshare_your_vault')}
          </Text>
          <Text size={14} color="supporting">
            {t('reshare_explanation')}
          </Text>
        </VStack>
        <VStack gap={20}>
          <InfoBlock>{t('reshare_disclaimer')}</InfoBlock>
          <Button
            onClick={() => navigate(makeAppPath('reshareVaultSecure'))}
            kind="primary"
          >
            {t('start_reshare')}
          </Button>
          <Button
            onClick={() => navigate(makeAppPath('reshareVaultFast'))}
            kind="outlined"
          >
            {t('start_reshare_with_server')}
          </Button>
          <Button
            onClick={() =>
              navigate(makeAppPath('uploadQr', { title: t('join_reshare') }))
            }
            kind="outlined"
          >
            {t('join_reshare')}
          </Button>
        </VStack>
      </PageContent>
    </>
  );
};
