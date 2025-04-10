import { ProductEnhancedLogo } from '@clients/extension/src/components/shared/Logo/ProductEnhancedLogo'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

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
