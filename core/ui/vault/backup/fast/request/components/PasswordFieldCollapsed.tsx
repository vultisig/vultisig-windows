import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { useBackupFormFieldState } from '../state/focusedField'
import { ServerBackupCollapsedRow } from './serverBackupField'

/** The closed password row of the Server Backup form; tapping it opens the field. */
export const PasswordFieldCollapsed = () => {
  const { t } = useTranslation()
  const [, setFocusedField] = useBackupFormFieldState()

  return (
    <ServerBackupCollapsedRow
      onClick={() =>
        setFocusedField(state => ({ ...state, field: 'password' }))
      }
    >
      <Text size={14}>{t('password')}</Text>
    </ServerBackupCollapsedRow>
  )
}
