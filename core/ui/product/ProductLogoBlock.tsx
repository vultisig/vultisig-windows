import { ProductEnhancedLogo } from '@core/ui/product/logo/ProductEnhancedLogo'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

export const ProductLogoBlock = () => {
  const { t } = useTranslation()

  return (
    <VStack alignItems="center" justifyContent="center" flexGrow fullHeight>
      <ProductEnhancedLogo style={{ fontSize: 250 }} />
      <Text color="contrast" weight="500" size={42}>
        {t('vultisig')}
      </Text>
    </VStack>
  )
}
