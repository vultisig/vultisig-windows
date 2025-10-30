import { CryptoIcon } from '@lib/ui/icons/CryptoIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

export const TokensEmptyState = () => {
  const { t } = useTranslation()

  return (
    <VStack alignItems="center" gap={16} style={{ padding: '64px 40px' }}>
      <IconWrapper size={48} color="textShy">
        <CryptoIcon />
      </IconWrapper>
      <VStack gap={8} alignItems="center">
        <Text size={17} weight="500" color="contrast" centerHorizontally>
          {t('no_tokens_selected')}
        </Text>
        <Text
          size={14}
          color="shy"
          centerHorizontally
          style={{ maxWidth: 280, textAlign: 'center' }}
        >
          {t('no_tokens_selected_description')}
        </Text>
      </VStack>
    </VStack>
  )
}
