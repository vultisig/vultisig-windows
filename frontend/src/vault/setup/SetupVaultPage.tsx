import { useTranslation } from 'react-i18next';

import { VStack } from '../../lib/ui/layout/Stack';
import { HStackSeparatedBy } from '../../lib/ui/layout/StackSeparatedBy';
import { Text } from '../../lib/ui/text';
import { makeAppPath } from '../../navigation';
import { PageContent } from '../../ui/page/PageContent';
import { PageHeader } from '../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../ui/page/PageHeaderTitle';
import { SetupVaultOption } from './SetupVaultOption';

export const SetupVaultPage = () => {
  const { t } = useTranslation();

  return (
    <VStack flexGrow>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={<PageHeaderTitle>{t('setup')}</PageHeaderTitle>}
      />
      <PageContent alignItems="center" justifyContent="center">
        <HStackSeparatedBy
          separator={
            <Text weight="700" color="contrast">
              {t('or')}
            </Text>
          }
          gap={8}
          wrap="wrap"
          alignItems="center"
          justifyContent="center"
        >
          <SetupVaultOption
            artSrc="/assets/icons/initiate.svg"
            title={t('initiating_device')}
            actionName={t('create_qr')}
            targetDestination={makeAppPath('setupVaultInitiatingDevice')}
          />
          <SetupVaultOption
            artSrc="/assets/icons/pair.svg"
            title={t('pairing_device')}
            actionName={t('scan_qr')}
            targetDestination={makeAppPath('importVault')}
          />
        </HStackSeparatedBy>
      </PageContent>
    </VStack>
  );
};
