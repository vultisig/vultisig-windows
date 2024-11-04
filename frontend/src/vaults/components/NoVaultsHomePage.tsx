import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { Button } from '../../lib/ui/buttons/Button';
import { VStack } from '../../lib/ui/layout/Stack';
import { makeAppPath } from '../../navigation';
import { ProductLogoBlock } from '../../ui/logo/ProductLogoBlock';
import { PageContent } from '../../ui/page/PageContent';

export const NoVaultsHomePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <PageContent>
      <VStack flexGrow alignItems="center" justifyContent="center">
        <ProductLogoBlock />
      </VStack>
      <VStack gap={20}>
        <Button onClick={() => navigate(makeAppPath('setupVault', {}))}>
          {t('create_new_vault')}
        </Button>
        <Button
          onClick={() => navigate(makeAppPath('importVault'))}
          kind="outlined"
        >
          {t('import_vault')}
        </Button>
      </VStack>
    </PageContent>
  );
};
