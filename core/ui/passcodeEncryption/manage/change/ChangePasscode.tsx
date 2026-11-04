import { passcodeEncryptionConfig } from '@core/ui/passcodeEncryption/core/config'
import { isWeakPasscode } from '@core/ui/passcodeEncryption/core/passcodePolicy'
import { useChangePasscodeMutation } from '@core/ui/passcodeEncryption/manage/change/mutations/changePasscode'
import { PasscodeInput } from '@core/ui/passcodeEncryption/manage/PasscodeInput'
import { usePasscode } from '@core/ui/passcodeEncryption/state/passcode'
import { SettingsBaselineText } from '@core/ui/settings/SettingsBaselineText'
import { Opener } from '@lib/ui/base/Opener'
import { Button } from '@lib/ui/buttons/Button'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { getFormProps } from '@lib/ui/form/utils/getFormProps'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { StationChevronRightSmallIcon } from '@lib/ui/icons/StationFigmaIcons'
import { LineSeparator } from '@lib/ui/layout/LineSeparator'
import { StackSeparatedBy } from '@lib/ui/layout/StackSeparatedBy'
import { Modal } from '@lib/ui/modal'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { extractErrorMsg } from '@vultisig/lib-utils/error/extractErrorMsg'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { securityRow } from '../securityRow'

const OpenerRow = styled(UnstyledButton)`
  ${securityRow};
  text-align: left;

  &:hover {
    background: ${getColor('foregroundExtra')};
  }

  &:focus-visible {
    outline: 2px solid ${getColor('primary')};
    outline-offset: -2px;
  }
`

/** The Change Passcode row of the Security card and the modal it opens. */
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

    if (
      newPasscode.length === passcodeEncryptionConfig.passcodeLength &&
      isWeakPasscode(newPasscode)
    ) {
      return t('invalid_passcode')
    }

    if (newPasscode !== confirmNewPasscode) {
      return t('passcodes_do_not_match')
    }
  }, [confirmNewPasscode, currentPasscode, newPasscode, passcode, t])

  const currentPasscodeFull =
    !!currentPasscode &&
    !!passcode &&
    currentPasscode.length === passcode.length

  const currentPasscodeValidation =
    currentPasscodeFull && currentPasscode !== passcode
      ? 'invalid'
      : currentPasscodeFull && currentPasscode === passcode
        ? 'valid'
        : undefined

  const newPasscodeFull =
    newPasscode?.length === passcodeEncryptionConfig.passcodeLength
  const confirmNewPasscodeFull =
    confirmNewPasscode?.length === passcodeEncryptionConfig.passcodeLength

  const confirmPasscodeMatch =
    newPasscodeFull &&
    confirmNewPasscodeFull &&
    newPasscode === confirmNewPasscode

  const confirmPasscodeMismatch =
    newPasscodeFull &&
    confirmNewPasscodeFull &&
    newPasscode !== confirmNewPasscode

  const confirmPasscodeValidation = confirmPasscodeMismatch
    ? 'invalid'
    : confirmPasscodeMatch
      ? 'valid'
      : undefined

  return (
    <Opener
      renderOpener={({ onOpen }) => (
        <OpenerRow onClick={onOpen}>
          <SettingsBaselineText
            as="span"
            color="regular"
            height={24 / 16}
            size={16}
            weight={500}
          >
            {t('change_passcode')}
          </SettingsBaselineText>
          <IconWrapper color="textShy" size={16}>
            <StationChevronRightSmallIcon />
          </IconWrapper>
        </OpenerRow>
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
              validation={currentPasscodeValidation}
              validationMessages={
                currentPasscodeValidation === 'invalid'
                  ? { invalid: t('incorrect_passcode') }
                  : undefined
              }
              length={
                passcode?.length ?? passcodeEncryptionConfig.passcodeLength
              }
              autoFocus
            />
            <PasscodeInput
              label={t('new_passcode')}
              onChange={setNewPasscode}
              value={newPasscode}
              validation={
                newPasscode?.length ===
                  passcodeEncryptionConfig.passcodeLength &&
                isWeakPasscode(newPasscode)
                  ? 'invalid'
                  : undefined
              }
              validationMessages={{ invalid: t('invalid_passcode') }}
            />
            <PasscodeInput
              label={t('confirm_new_passcode')}
              onChange={setConfirmNewPasscode}
              value={confirmNewPasscode}
              validation={confirmPasscodeValidation}
              validationMessages={
                confirmPasscodeValidation === 'invalid'
                  ? { invalid: t('passcodes_do_not_match') }
                  : undefined
              }
            />
            {error && <Text color="danger">{extractErrorMsg(error)}</Text>}
          </StackSeparatedBy>
        </Modal>
      )}
    />
  )
}
