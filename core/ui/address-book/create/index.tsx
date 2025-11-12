import {
  AddressBookForm,
  AddressBookFormValues,
} from '@core/ui/address-book/form'
import { useCore } from '@core/ui/state/core'
import {
  useAddressBookItemOrders,
  useCreateAddressBookItemMutation,
} from '@core/ui/storage/addressBook'
import { useNavigation } from '@lib/ui/navigation/state'
import { getLastItemOrder } from '@lib/utils/order/getLastItemOrder'
import { useTranslation } from 'react-i18next'
import { v4 as uuidv4 } from 'uuid'

export const CreateAddressBookItemPage = () => {
  const [{ history }] = useNavigation()
  const currentView = history[history.length - 1]
  const state =
    currentView?.id === 'createAddressBookItem' ? currentView.state : undefined
  const { t } = useTranslation()
  const { mutate, error, isPending } = useCreateAddressBookItemMutation()
  const addressBookItemOrders = useAddressBookItemOrders()
  const { goBack, goHome } = useCore()

  // Check if we came from a keysign flow (has pre-filled address/chain)
  const cameFromKeysign = !!(state?.address && state?.chain)

  const handleCreateAddress = (values: AddressBookFormValues) => {
    const { address, chain, title } = values

    mutate(
      {
        address,
        chain,
        id: uuidv4(),
        order: getLastItemOrder(addressBookItemOrders),
        title,
      },
      {
        onSuccess: () => {
          if (cameFromKeysign) {
            goHome()
          } else {
            goBack()
          }
        },
      }
    )
  }

  return (
    <AddressBookForm
      defaultValues={{
        address: state?.address ?? '',
        chain: state?.chain,
        title: '',
      }}
      onBack={cameFromKeysign ? goHome : undefined}
      error={error}
      isPending={isPending}
      onSubmit={handleCreateAddress}
      title={t('add_address')}
    />
  )
}
