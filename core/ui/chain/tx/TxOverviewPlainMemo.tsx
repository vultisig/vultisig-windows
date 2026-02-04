import { HStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

export const TxOverviewPlainMemo = ({ value }: ValueProp<string>) => {
  const { t } = useTranslation()

  return (
    <HStack alignItems="center" gap={4} justifyContent="space-between">
      <Text size={14} color="shy" weight="500">
        {t('memo')}
      </Text>
      <Text color="primary" size={14}>
        {value}
      </Text>
    </HStack>
  )
}
