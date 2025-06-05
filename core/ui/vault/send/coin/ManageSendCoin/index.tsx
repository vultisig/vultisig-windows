import { StackedField } from '../../StackedField'
import { useSendFormFieldState } from '../../state/formFields'
import { ManageSendCoinCollapsedInputField } from './components/ManageSendCoinCollapsedInputField'
import { ManageSendCoinInputField } from './components/ManageSendCoinInputField'

export const ManageSendCoin = () => {
  const [{ field }] = useSendFormFieldState()

  return (
    <StackedField
      isOpen={field === 'coin'}
      renderOpen={() => <ManageSendCoinInputField />}
      renderClose={() => <ManageSendCoinCollapsedInputField />}
    />
  )
}
