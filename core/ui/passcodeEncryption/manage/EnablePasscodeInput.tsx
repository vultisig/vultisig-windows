import { Switch } from '@lib/ui/inputs/switch'
import { hStack, VStack } from '@lib/ui/layout/Stack'
import { InputProps } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type EnablePasscodeInputProps = InputProps<boolean> & {
  errorMessage?: string
}

const ActionContainer = styled.div`
  ${hStack({ alignItems: 'center', gap: 12 })}
  min-height: 34px;
`

export const EnablePasscodeInput = ({
  value,
  onChange,
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
        {/* Nothing is layered over the switch while the passcode operation
            runs: it stays mounted and simply slides, the way a plain checkbox
            would. Turning the passcode off takes a few hundred milliseconds,
            far below the point where a progress indicator helps — one that
            appears and vanishes inside that window reads as a flicker. */}
        <Switch
          checked={value}
          label={t(value ? 'on' : 'off').toUpperCase()}
          onChange={onChange}
        />
      </ActionContainer>
      {errorMessage && <Text color="danger">{errorMessage}</Text>}
    </VStack>
  )
}
