import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Button } from '../../lib/ui/buttons/Button';
import { VStack } from '../../lib/ui/layout/Stack';
import { makeAppPath } from '../../navigation';
import { ProductLogoBlock } from '../../ui/logo/ProductLogoBlock';
import { PageContent } from '../../ui/page/PageContent';
import { PageHeader } from '../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../ui/page/PageHeaderBackButton';

export const AddVaultPage = () => {
  const { t } = useTranslation();

  return (
    <VStack flexGrow>
      <PageHeader primaryControls={<PageHeaderBackButton />} />
      <PageContent gap={16}>
        <ProductLogoBlock />
        <VStack gap={16}>
          <Link to={makeAppPath('setupVaultOptions')}>
            <Button as="div">{t('create_new_vault')}</Button>
          </Link>
          <Link to={makeAppPath('importVault')}>
            <Button as="div" kind="outlined">
              {t('import_existing_vault')}
            </Button>
          </Link>
        </VStack>
      </PageContent>
    </VStack>
  );
};
