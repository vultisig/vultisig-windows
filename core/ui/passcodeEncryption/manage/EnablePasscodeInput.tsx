import { SettingsBaselineText } from '@core/ui/settings/SettingsBaselineText'
import { Switch } from '@lib/ui/inputs/switch'
import { VStack } from '@lib/ui/layout/Stack'
import { InputProps } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { securityRow } from './securityRow'

type EnablePasscodeInputProps = InputProps<boolean> & {
  errorMessage?: string
}

const Row = styled.div`
  ${securityRow};
`

// The frame's toggle has no visible state word. It stays over the track so the
// switch keeps its accessible name and its text target.
const StateLabel = styled.span`
  inset: 0;
  opacity: 0;
  overflow: hidden;
  position: absolute;
`

/** The App Lock row of the Security card: a title and the toggle. */
export const EnablePasscodeInput = ({
  value,
  onChange,
  errorMessage,
}: EnablePasscodeInputProps) => {
  const { t } = useTranslation()

  return (
    <Row>
      <VStack gap={4}>
        <SettingsBaselineText
          as="span"
          color="regular"
          height={24 / 16}
          size={16}
          weight={500}
        >
          {t('app_lock_passcode')}
        </SettingsBaselineText>
        {errorMessage && <Text color="danger">{errorMessage}</Text>}
      </VStack>
      {/* Nothing is layered over the switch while the passcode operation
          runs: it stays mounted and simply slides, the way a plain checkbox
          would. Turning the passcode off takes a few hundred milliseconds,
          far below the point where a progress indicator helps — one that
          appears and vanishes inside that window reads as a flicker. */}
      <Switch
        checked={value}
        label={<StateLabel>{t(value ? 'on' : 'off').toUpperCase()}</StateLabel>}
        onChange={onChange}
        size="large"
      />
    </Row>
  )
}
