import {
  settingsFieldValidation,
  settingsInputHeight,
} from '@core/ui/settings/settingsField'
import { PasswordInput } from '@lib/ui/inputs/PasswordInput'
import { VStack } from '@lib/ui/layout/Stack'
import { UseFormRegisterReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { serverBackupTextInput } from './serverBackupField'
import { ServerBackupFieldHeading } from './ServerBackupFieldHeading'

const Field = styled(PasswordInput)`
  ${serverBackupTextInput};
  ${settingsFieldValidation};
`

type PasswordFieldExpandedProps = {
  registration: UseFormRegisterReturn<'password'>
  error?: string
}

/** The open password field of the Server Backup form; masked until the eye is pressed. */
export const PasswordFieldExpanded = ({
  registration,
  error,
}: PasswordFieldExpandedProps) => {
  const { t } = useTranslation()

  return (
    <VStack gap={24}>
      <ServerBackupFieldHeading
        title={t('enter_password')}
        description={t('backup_password_description')}
      />
      <Field
        {...registration}
        inputHeight={settingsInputHeight}
        placeholder={t('enter_password')}
        error={error}
        validation={error ? 'invalid' : undefined}
      />
    </VStack>
  )
}
