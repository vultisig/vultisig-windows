import { StackedField } from '../StackedField'
import { useSendFormFieldState } from '../state/formFields'
import { ManageAmountInputField } from './ManageAmountInputField'
import { ManageAmountInputFieldCollapsed } from './ManageAmountInputFieldCollapsed'

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
