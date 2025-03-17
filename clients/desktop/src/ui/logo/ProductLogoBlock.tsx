import { useTranslation } from 'react-i18next'

import { VStack } from '../../lib/ui/layout/Stack'
import { Text } from '../../lib/ui/text'
import { ProductEnhancedLogo } from '../../ui/logo/ProductEnhancedLogo'

export const ProductLogoBlock = () => {
  const { t } = useTranslation()

  return (
    <VStack flexGrow alignItems="center" justifyContent="center">
      <ProductEnhancedLogo style={{ fontSize: 250 }} />
      <Text color="contrast" weight="500" size={42}>
        {t('vultisig')}
      </Text>
    </VStack>
  )
}
