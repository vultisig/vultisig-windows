import { ManageAmountInputField } from '@core/ui/vault/send/amount/ManageAmountInputField'
import { ManageAmountInputFieldCollapsed } from '@core/ui/vault/send/amount/ManageAmountInputFieldCollapsed'
import { StackedField } from '@core/ui/vault/send/StackedField'
import { useSendFormFieldState } from '@core/ui/vault/send/state/formFields'

export const ManageAmount = () => {
  const [{ field }] = useSendFormFieldState()
  const value = field == 'amount' ? 'open' : 'closed'

  return (
    <StackedField
      renderOpen={() => <ManageAmountInputField />}
      renderClose={() => <ManageAmountInputFieldCollapsed />}
      isOpen={value === 'open'}
    />
  )
}
