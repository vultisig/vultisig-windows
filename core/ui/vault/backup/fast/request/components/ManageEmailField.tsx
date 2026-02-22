import { StackedField } from '@core/ui/vault/components/action-form/StackedField'
import { UseFormRegisterReturn } from 'react-hook-form'

import { useBackupFormFieldState } from '../state/focusedField'
import { EmailFieldCollapsed } from './EmailFieldCollapsed'
import { EmailFieldExpanded } from './EmailFieldExpanded'

type ManageEmailFieldProps = {
  registration: UseFormRegisterReturn<'email'>
  onValueChange: (value: string) => void
  onClear: () => void
  error?: string
  isEmailValid: boolean
  email: string
}

export const ManageEmailField = ({
  registration,
  onValueChange,
  onClear,
  error,
  isEmailValid,
  email,
}: ManageEmailFieldProps) => {
  const [{ field }] = useBackupFormFieldState()

  return (
    <StackedField
      isOpen={field === 'email'}
      renderOpen={() => (
        <EmailFieldExpanded
          registration={registration}
          onValueChange={onValueChange}
          onClear={onClear}
          error={error}
          isEmailValid={isEmailValid}
        />
      )}
      renderClose={() => (
        <EmailFieldCollapsed email={email} isEmailValid={isEmailValid} />
      )}
    />
  )
}
