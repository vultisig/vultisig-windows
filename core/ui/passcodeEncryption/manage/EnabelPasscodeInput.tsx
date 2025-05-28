import { Switch } from '@lib/ui/inputs/switchControlContainer'
import { VStack } from '@lib/ui/layout/Stack'
import { InputProps } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

export const EnablePasscodeInput = ({
  value,
  onChange,
}: InputProps<boolean>) => {
  const { t } = useTranslation()

  return (
    <VStack gap={4}>
      <Text height="large" size={16} color="contrast">
        {t('app_lock_passcode')}
      </Text>
      <Text size={12}>{t('app_lock_passcode_description')}</Text>
      <Switch
        value={value}
        onChange={onChange}
        label={t(value ? 'on' : 'off').toUpperCase()}
      />
    </VStack>
  )
}
