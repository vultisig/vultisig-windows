import { useTranslation } from 'react-i18next';
import { VStack } from '../../lib/ui/layout/Stack';
import { PageContent } from '../../ui/page/PageContent';
import { PageHeader } from '../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../ui/page/PageHeaderTitle';
import { Button } from '../../lib/ui/buttons/Button';
import { ShareVaultCard } from './ShareVaultCard';
import { SaveAsImage } from '../../ui/file/SaveAsImage';
import { useAssertCurrentVault } from '../state/useCurrentVault';

export const ShareVaultPage = () => {
  const { t } = useTranslation();
  const { name } = useAssertCurrentVault();

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
          <SaveAsImage
            fileName={name}
            renderTrigger={({ onClick }) => (
              <Button onClick={onClick}>{t('save')}</Button>
            )}
            value={<ShareVaultCard />}
          />
        </VStack>
      </PageContent>
    </VStack>
  );
};
