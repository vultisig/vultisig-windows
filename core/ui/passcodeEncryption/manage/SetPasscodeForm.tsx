import { SettingsCtaButton } from '@core/ui/settings/SettingsCtaButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { getFormProps } from '@lib/ui/form/utils/getFormProps'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { extractErrorMsg } from '@vultisig/lib-utils/error/extractErrorMsg'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { passcodeEncryptionConfig } from '../core/config'
import { isWeakPasscode } from '../core/passcodePolicy'
import { PasscodeInput } from './PasscodeInput'
import { SetPasscodeHeading } from './SetPasscodeHeading'

type SetPasscodeFormProps = {
  error: Error | null
  isPending: boolean
  onSubmit: (passcode: string) => void
}

const GlowClip = styled.div`
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  position: absolute;
`

const Glow = styled.div`
  ${borderRadius.pill};
  background: ${getColor('primaryAccentFour')};
  filter: blur(127px);
  height: 338px;
  left: 50%;
  opacity: 0.2;
  position: absolute;
  top: 125px;
  transform: translateX(-50%);
  width: 304px;
`

const Fields = styled(VStack)`
  position: relative;
`

const SubmitButton = styled(SettingsCtaButton)`
  margin-top: auto;
  position: relative;
`

/**
 * Passcode entry and confirmation shown under the App Lock switch while a new
 * passcode is being set. The switch and the mutation both live in
 * {@link AppLockSwitch}, so the switch stays mounted across the whole flow and
 * can ignore toggles while the sealing is still running.
 */
export const SetPasscodeForm = ({
  error,
  isPending,
  onSubmit,
}: SetPasscodeFormProps) => {
  const [passcode, setPasscode] = useState<string | null>(null)
  const [confirmPasscode, setConfirmPasscode] = useState<string | null>(null)

  const { t } = useTranslation()

  const isDisabled = useMemo(() => {
    if (!passcode) {
      return t('enter_passcode')
    }

    if (!confirmPasscode) {
      return t('confirm_passcode')
    }

    if (
      passcode.length === passcodeEncryptionConfig.passcodeLength &&
      isWeakPasscode(passcode)
    ) {
      return t('invalid_passcode')
    }

    if (passcode !== confirmPasscode) {
      return t('passcodes_do_not_match')
    }
  }, [confirmPasscode, passcode, t])

  const confirmPasscodeValidation =
    confirmPasscode?.length === passcodeEncryptionConfig.passcodeLength
      ? confirmPasscode === passcode
        ? 'valid'
        : 'invalid'
      : undefined

  return (
    <VStack
      flexGrow
      gap={24}
      as="form"
      {...getFormProps({
        isDisabled,
        isPending,
        onSubmit: () => {
          onSubmit(shouldBePresent(passcode))
        },
      })}
    >
      <GlowClip aria-hidden>
        <Glow />
      </GlowClip>
      <Fields alignItems="center" gap={15}>
        <SetPasscodeHeading />
        <PasscodeInput
          appearance="dots"
          onChange={setPasscode}
          value={passcode}
          validation={
            passcode?.length === passcodeEncryptionConfig.passcodeLength &&
            isWeakPasscode(passcode)
              ? 'invalid'
              : undefined
          }
          validationMessages={{ invalid: t('invalid_passcode') }}
          autoFocus
        />
        <VStack alignItems="center" gap={7}>
          <Text
            centerHorizontally
            color="shyExtra"
            height={20 / 14}
            size={14}
            weight={400}
          >
            {t('confirm_passcode')}
          </Text>
          <PasscodeInput
            appearance="dots"
            onChange={setConfirmPasscode}
            value={confirmPasscode}
            validation={confirmPasscodeValidation}
            validationMessages={{
              invalid: t('passcodes_do_not_match'),
              valid: '',
            }}
          />
        </VStack>
        {error && <Text color="danger">{extractErrorMsg(error)}</Text>}
      </Fields>
      <SubmitButton disabled={isDisabled} loading={isPending} type="submit">
        {t('set_passcode')}
      </SubmitButton>
    </VStack>
  )
}
