import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

// Messages sign one after another, so from here on the wait is noticeably long
const manyInputsMessageCount = 10

export const KeysignManyInputsNotice = ({ value }: ValueProp<number>) => {
  const { t } = useTranslation()

  if (value < manyInputsMessageCount) return null

  return (
    <Text color="shy" size={14} centerHorizontally>
      {t('keysign_many_inputs', { count: value })}
    </Text>
  )
}
