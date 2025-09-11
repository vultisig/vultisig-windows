import { VStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

export const TxOverviewPlainMemo = ({ value }: ValueProp<string>) => {
  const { t } = useTranslation()

  return (
    <VStack gap={4}>
      <Text size={14} color="shy">
        {t('memo')}
      </Text>
      <Text color="primary" size={14}>
        {value}
      </Text>
    </VStack>
  )
}
