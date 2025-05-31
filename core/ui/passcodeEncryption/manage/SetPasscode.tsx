import { Opener } from '@lib/ui/base/Opener'
import { Button } from '@lib/ui/buttons/Button'
import { getFormProps } from '@lib/ui/form/utils/getFormProps'
import { VStack } from '@lib/ui/layout/Stack'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useSetPasscodeMutation } from '../mutations/useSetPasscodeMutation'
import { EnablePasscodeInput } from './EnablePasscodeInput'
import { PasscodeInput } from './PasscodeInput'

export const SetPasscode = () => {
  const [passcode, setPasscode] = useState<string | null>(null)
  const [confirmPasscode, setConfirmPasscode] = useState<string | null>(null)

  const {
    mutate: setPasscodeMutation,
    isPending,
    error,
  } = useSetPasscodeMutation()

  const { t } = useTranslation()

  const isDisabled = useMemo(() => {
    if (!passcode) {
      return t('enter_passcode')
    }

    if (!confirmPasscode) {
      return t('confirm_passcode')
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
          setPasscodeMutation(shouldBePresent(passcode))
        },
      })}
    >
      <Opener
        renderOpener={({ onOpen, onClose, isOpen }) => (
          <EnablePasscodeInput
            value={isOpen}
            onChange={isOpen ? onClose : onOpen}
            pendingMessage={
              isPending ? t('encrypting_vault_keyshares') : undefined
            }
            errorMessage={error ? extractErrorMsg(error) : undefined}
          />
        )}
        renderContent={() => (
          <>
            <PasscodeInput onChange={setPasscode} label={t('enter_passcode')} />
            <PasscodeInput
              onChange={setConfirmPasscode}
              label={t('confirm_passcode')}
            />
            <Button
              disabled={!!isDisabled}
              htmlType="submit"
              kind="primary"
              label={t('set_passcode')}
              loading={isPending}
            />
          </>
        )}
      />
    </VStack>
  )
}
