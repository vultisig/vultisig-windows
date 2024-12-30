import { useTranslation } from 'react-i18next';

import { Button } from '../../lib/ui/buttons/Button';
import { VStack } from '../../lib/ui/layout/Stack';
import { useAppNavigate } from '../../navigation/hooks/useAppNavigate';
import { ProductLogoBlock } from '../../ui/logo/ProductLogoBlock';
import { PageContent } from '../../ui/page/PageContent';

export const NoVaultsHomePage = () => {
  const { t } = useTranslation();
  const navigate = useAppNavigate();

  return (
    <PageContent>
      <VStack flexGrow alignItems="center" justifyContent="center">
        <ProductLogoBlock />
      </VStack>
      <VStack gap={20}>
        <Button onClick={() => navigate('setupVault', { params: {} })}>
          {t('create_new_vault')}
        </Button>
        <Button onClick={() => navigate('importVault')} kind="outlined">
          {t('import_vault')}
        </Button>
      </VStack>
    </PageContent>
  );
};
