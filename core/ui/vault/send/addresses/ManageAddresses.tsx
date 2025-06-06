import { StackedField } from '../StackedField'
import { useSendFormFieldState } from '../state/formFields'
import { ManageReceiverAddressInputField } from './components/ManageAddressesInputField'
import { ManageAddressesInputFieldCollapsed } from './components/ManageAddressesInputFieldCollapsed'

export const ManageAddresses = () => {
  const [{ field }] = useSendFormFieldState()
  const value = field == 'address' ? 'open' : 'closed'

  return (
    <StackedField
      isOpen={value === 'open'}
      renderOpen={() => <ManageReceiverAddressInputField />}
      renderClose={() => <ManageAddressesInputFieldCollapsed />}
    />
  )
}
