import { Text } from '@lib/ui/text'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

type MpcSignersTitleProps = {
  target: number
  current: number
}

export const MpcSignersTitle: FC<MpcSignersTitleProps> = ({
  target,
  current,
}) => {
  const { t } = useTranslation()

  return (
    <Text color="contrast" size={22} weight="500">
      {t('devices')} ({current}/{target})
    </Text>
  )
}
