import { Hoverable } from '@lib/ui/base/Hoverable'
import { OnClickProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

export const FinishEditing: React.FC<OnClickProp> = ({ onClick }) => {
  const { t } = useTranslation()

  return (
    <Hoverable onClick={onClick}>
      <Text color="contrast" size={14} weight="600">
        {t('done')}
      </Text>
    </Hoverable>
  )
}
