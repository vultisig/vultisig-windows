import { VStack } from '@lib/ui/layout/Stack'
import { WarningBlock } from '@lib/ui/status/WarningBlock'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

/**
 * Shown when a transaction invokes the kVaults program but does not decode.
 *
 * This is a refusal, not a caveat. The bytes reach for a program whose
 * transactions this app is willing to describe, and it cannot describe this
 * one — so the honest answer is that it will not be signed here, rather than a
 * summary that omits whatever could not be read.
 */
export const KaminoUnreadableTransaction = () => {
  const { t } = useTranslation()

  return (
    <VStack gap={8}>
      <WarningBlock>{t('kamino_earn_unreadable_title')}</WarningBlock>
      <Text size={12} color="shy">
        {t('kamino_earn_unreadable_description')}
      </Text>
    </VStack>
  )
}
