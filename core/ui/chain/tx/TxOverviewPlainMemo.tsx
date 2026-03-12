import { VStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

export const TxOverviewPlainMemo = ({ value }: ValueProp<string>) => {
  const { t } = useTranslation()

  return (
    <VStack gap={4}>
      <Text color="shy">{t('memo')}</Text>
      <Text color="primary" family="mono" size={14} weight="700">
        {value}
      </Text>
    </VStack>
  )
}
