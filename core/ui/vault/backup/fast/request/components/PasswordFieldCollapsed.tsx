import { CollapsedFieldContainer } from '@core/ui/vault/components/action-form/CollapsedFieldContainer'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { useBackupFormFieldState } from '../state/focusedField'

export const PasswordFieldCollapsed = () => {
  const { t } = useTranslation()
  const [, setFocusedField] = useBackupFormFieldState()

  return (
    <CollapsedFieldContainer
      onClick={() =>
        setFocusedField(state => ({ ...state, field: 'password' }))
      }
    >
      <Text size={14}>{t('password')}</Text>
    </CollapsedFieldContainer>
  )
}
