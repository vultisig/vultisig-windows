import { useTranslation } from 'react-i18next';

import { Button } from '../../lib/ui/buttons/Button';
import { VStack } from '../../lib/ui/layout/Stack';
import { SaveAsImage } from '../../ui/file/SaveAsImage';
import { PageContent } from '../../ui/page/PageContent';
import { PageHeader } from '../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../ui/page/PageHeaderTitle';
import { useAssertCurrentVault } from '../state/useCurrentVault';
import { ShareVaultCard } from './ShareVaultCard';

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
