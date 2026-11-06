import {
  ActionFormCheckBadge,
  ActionFormIconsWrapper,
} from '@core/ui/vault/components/action-form/ActionFormIconsWrapper'
import { PencilIconWrapper } from '@core/ui/vault/components/action-form/PencilIconWrapper'
import { CheckmarkIcon } from '@lib/ui/icons/CheckmarkIcon'
import { PencilIcon } from '@lib/ui/icons/PenciIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { useBackupFormFieldState } from '../state/focusedField'
import { ServerBackupCollapsedRow } from './serverBackupField'

type EmailFieldCollapsedProps = {
  email: string
  isEmailValid: boolean
}

/** The closed email row of the Server Backup form; tapping it opens the field. */
export const EmailFieldCollapsed = ({
  email,
  isEmailValid,
}: EmailFieldCollapsedProps) => {
  const { t } = useTranslation()
  const [, setFocusedField] = useBackupFormFieldState()

  return (
    <ServerBackupCollapsedRow
      onClick={() => setFocusedField(state => ({ ...state, field: 'email' }))}
    >
      <HStack gap={12} alignItems="center">
        <Text size={14}>{t('email')}</Text>
        {email && (
          <Text cropped size={12} color="shy">
            {email}
          </Text>
        )}
      </HStack>
      <ActionFormIconsWrapper gap={12}>
        {isEmailValid && email && (
          <>
            <ActionFormCheckBadge>
              <CheckmarkIcon />
            </ActionFormCheckBadge>
            <PencilIconWrapper>
              <PencilIcon />
            </PencilIconWrapper>
          </>
        )}
      </ActionFormIconsWrapper>
    </ServerBackupCollapsedRow>
  )
}
