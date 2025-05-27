import {
  AddressBookForm,
  AddressBookFormValues,
} from '@core/ui/address-book/form'
import {
  useAddressBookItemOrders,
  useCreateAddressBookItemMutation,
} from '@core/ui/storage/addressBook'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { getLastItemOrder } from '@lib/utils/order/getLastItemOrder'
import { useTranslation } from 'react-i18next'
import { v4 as uuidv4 } from 'uuid'

export const CreateAddressBookItemPage = () => {
  const { t } = useTranslation()
  const { mutate, error, isPending } = useCreateAddressBookItemMutation()
  const addressBookItemOrders = useAddressBookItemOrders()
  const navigateBack = useNavigateBack()

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
      { onSuccess: navigateBack }
    )
  }

  return (
    <AddressBookForm
      error={error}
      isPending={isPending}
      onSubmit={handleCreateAddress}
      title={t('add_address')}
    />
  )
}
