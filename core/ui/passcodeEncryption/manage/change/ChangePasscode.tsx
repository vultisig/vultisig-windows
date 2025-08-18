import { useChangePasscodeMutation } from '@core/ui/passcodeEncryption/manage/change/mutations/changePasscode'
import { PasscodeInput } from '@core/ui/passcodeEncryption/manage/PasscodeInput'
import { usePasscode } from '@core/ui/passcodeEncryption/state/passcode'
import { Opener } from '@lib/ui/base/Opener'
import { Button } from '@lib/ui/buttons/Button'
import { getFormProps } from '@lib/ui/form/utils/getFormProps'
import { LineSeparator } from '@lib/ui/layout/LineSeparator'
import { StackSeparatedBy } from '@lib/ui/layout/StackSeparatedBy'
import { Modal } from '@lib/ui/modal'
import { Text } from '@lib/ui/text'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

export const ChangePasscode = () => {
  const { t } = useTranslation()
  const [passcode] = usePasscode()
  const [currentPasscode, setCurrentPasscode] = useState<string | null>(null)
  const [newPasscode, setNewPasscode] = useState<string | null>(null)
  const [confirmNewPasscode, setConfirmNewPasscode] = useState<string | null>(
    null
  )

  const {
    mutate: changePasscode,
    isPending,
    error,
  } = useChangePasscodeMutation()

  const isDisabled = useMemo(() => {
    if (!currentPasscode) {
      return t('enter_passcode')
    }

    if (currentPasscode !== passcode) {
      return t('invalid_passcode')
    }

    if (!newPasscode) {
      return t('enter_new_passcode')
    }

    if (!confirmNewPasscode) {
      return t('confirm_new_passcode')
    }

    if (newPasscode !== confirmNewPasscode) {
      return t('passcodes_do_not_match')
    }
  }, [confirmNewPasscode, currentPasscode, newPasscode, passcode, t])

  return (
    <Opener
      renderOpener={({ onOpen }) => (
        <Button onClick={onOpen}>{t('change_passcode')}</Button>
      )}
      renderContent={({ onClose }) => (
        <Modal
          title={t('change_passcode')}
          onClose={onClose}
          as="form"
          footer={
            <Button disabled={isDisabled} loading={isPending} type="submit">
              {t('save')}
            </Button>
          }
          {...getFormProps({
            isDisabled,
            isPending,
            onSubmit: () => {
              changePasscode(shouldBePresent(newPasscode), {
                onSuccess: onClose,
              })
            },
          })}
        >
          <StackSeparatedBy
            direction="column"
            separator={<LineSeparator />}
            gap={14}
          >
            <PasscodeInput
              label={t('current_passcode')}
              onChange={setCurrentPasscode}
              value={currentPasscode}
              autoFocus
            />
            <PasscodeInput
              label={t('new_passcode')}
              onChange={setNewPasscode}
              value={newPasscode}
            />
            <PasscodeInput
              label={t('confirm_new_passcode')}
              onChange={setConfirmNewPasscode}
              value={confirmNewPasscode}
            />
            {error && <Text color="danger">{extractErrorMsg(error)}</Text>}
          </StackSeparatedBy>
        </Modal>
      )}
    />
  )
}
