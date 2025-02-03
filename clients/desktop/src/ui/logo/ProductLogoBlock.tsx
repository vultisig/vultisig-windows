import { useTranslation } from 'react-i18next';

import { VStack } from '../../lib/ui/layout/Stack';
import { Text } from '../../lib/ui/text';
import { ProductEnhancedLogo } from '../../ui/logo/ProductEnhancedLogo';

export const ProductLogoBlock = () => {
  const { t } = useTranslation();

  return (
    <VStack flexGrow alignItems="center" justifyContent="center">
      <ProductEnhancedLogo style={{ fontSize: 200 }} />
      <Text color="contrast" weight="700" size={32}>
        {t('vultisig')}
      </Text>
      <Text color="contrast" weight="700" size={18}>
        {t('secure_crypto_vault')}
      </Text>
    </VStack>
  );
};
