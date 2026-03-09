import { ScreenLayout } from '@lib/ui/layout/ScreenLayout/ScreenLayout'
import { VStack } from '@lib/ui/layout/Stack'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

export const TransactionHistoryPage = () => {
  const goBack = useNavigateBack()
  const { t } = useTranslation()

  return (
    <ScreenLayout title={t('transaction_history')} onBack={goBack}>
      <VStack flexGrow justifyContent="center" alignItems="center">
        <Text size={20} weight={500} color="shy">
          {t('coming_soon')}
        </Text>
      </VStack>
    </ScreenLayout>
  )
}
