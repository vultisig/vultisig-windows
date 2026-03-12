import { StackedField } from '@core/ui/vault/components/action-form/StackedField'
import { UseFormRegisterReturn } from 'react-hook-form'

import { useBackupFormFieldState } from '../state/focusedField'
import { PasswordFieldCollapsed } from './PasswordFieldCollapsed'
import { PasswordFieldExpanded } from './PasswordFieldExpanded'

type ManagePasswordFieldProps = {
  registration: UseFormRegisterReturn<'password'>
  error?: string
}

export const ManagePasswordField = ({
  registration,
  error,
}: ManagePasswordFieldProps) => {
  const [{ field }] = useBackupFormFieldState()

  return (
    <StackedField
      isOpen={field === 'password'}
      renderOpen={() => (
        <PasswordFieldExpanded registration={registration} error={error} />
      )}
      renderClose={() => <PasswordFieldCollapsed />}
    />
  )
}
