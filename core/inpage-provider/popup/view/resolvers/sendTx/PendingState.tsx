import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

export const PendingState = () => {
  const { t } = useTranslation()

  return (
    <VStack flexGrow alignItems="center" justifyContent="center">
      <HStack alignItems="center" gap={8}>
        <Spinner />
        <Text>{t('processing_transaction')}</Text>
      </HStack>
    </VStack>
  )
}
