import { Button } from '@lib/ui/buttons/Button'
import { getFormProps } from '@lib/ui/form/utils/getFormProps'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { extractErrorMsg } from '@vultisig/lib-utils/error/extractErrorMsg'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { passcodeEncryptionConfig } from '../core/config'
import { isWeakPasscode } from '../core/passcodePolicy'
import { PasscodeInput } from './PasscodeInput'

type SetPasscodeFormProps = {
  error: Error | null
  isPending: boolean
  onSubmit: (passcode: string) => void
}

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

  return (
    <VStack
      gap={14}
      as="form"
      {...getFormProps({
        isDisabled,
        isPending,
        onSubmit: () => {
          onSubmit(shouldBePresent(passcode))
        },
      })}
    >
      <PasscodeInput
        label={t('enter_passcode')}
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
      <PasscodeInput
        label={t('confirm_passcode')}
        onChange={setConfirmPasscode}
        value={confirmPasscode}
      />
      {error && <Text color="danger">{extractErrorMsg(error)}</Text>}
      <Button disabled={isDisabled} loading={isPending} type="submit">
        {t('set_passcode')}
      </Button>
    </VStack>
  )
}
