import { Switch } from '@lib/ui/inputs/switch'
import { VStack, vStack } from '@lib/ui/layout/Stack'
import { InputProps } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type EnablePasscodeInputProps = InputProps<boolean> & {
  pendingMessage?: string
  errorMessage?: string
}

const ActionContainer = styled.div`
  ${vStack({ justifyContent: 'center' })}
  min-height: 34px;
`

export const EnablePasscodeInput = ({
  value,
  onChange,
  pendingMessage,
  errorMessage,
}: EnablePasscodeInputProps) => {
  const { t } = useTranslation()

  return (
    <VStack gap={4}>
      <Text height="large" size={16} color="contrast">
        {t('app_lock_passcode')}
      </Text>
      <Text color="supporting" size={12}>
        {t('app_lock_passcode_description')}
      </Text>
      <ActionContainer>
        {pendingMessage ? (
          <Text color="supporting">{pendingMessage}</Text>
        ) : (
          <Switch
            checked={value}
            label={t(value ? 'on' : 'off').toUpperCase()}
            onChange={onChange}
          />
        )}
      </ActionContainer>
      {errorMessage && <Text color="danger">{errorMessage}</Text>}
    </VStack>
  )
}
