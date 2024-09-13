import { useTranslation } from 'react-i18next';
import { VStack } from '../../lib/ui/layout/Stack';
import { PageContent } from '../../ui/page/PageContent';
import { PageHeader } from '../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../ui/page/PageHeaderTitle';
import { Button } from '../../lib/ui/buttons/Button';
import { ShareVaultCard } from './ShareVaultCard';

export const ShareVaultPage = () => {
  const { t } = useTranslation();

  return (
    <VStack flexGrow>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={<PageHeaderTitle>{t('share_vault_qr')}</PageHeaderTitle>}
      />
      <PageContent alignItems="center" gap={40}>
        <VStack fullWidth alignItems="center" justifyContent="center" flexGrow>
          <ShareVaultCard />
        </VStack>
        <VStack fullWidth>
          <Button>{t('save')}</Button>
        </VStack>
      </PageContent>
    </VStack>
  );
};
