import { useTranslation } from 'react-i18next';

import { Button } from '../../../lib/ui/buttons/Button';
import { AnimatedVisibility } from '../../../lib/ui/layout/AnimatedVisibility';
import { VStack } from '../../../lib/ui/layout/Stack';
import { useAppNavigate } from '../../../navigation/hooks/useAppNavigate';
import { ProductLogoBlock } from '../../../ui/logo/ProductLogoBlock';
import { Wrapper } from './NoVaultsHomePage.styled';

export const NoVaultsHomePage = () => {
  const { t } = useTranslation();
  const navigate = useAppNavigate();

  return (
    <Wrapper>
      <VStack flexGrow alignItems="center" justifyContent="center">
        <AnimatedVisibility delay={500}>
          <ProductLogoBlock />
        </AnimatedVisibility>
      </VStack>
      <AnimatedVisibility animationConfig="bottomToTop" delay={800}>
        <VStack gap={20}>
          <Button onClick={() => navigate('setupVault', { params: {} })}>
            {t('create_new_vault')}
          </Button>
          <Button onClick={() => navigate('importVault')} kind="secondary">
            {t('import_vault')}
          </Button>
        </VStack>
      </AnimatedVisibility>
    </Wrapper>
  );
};
