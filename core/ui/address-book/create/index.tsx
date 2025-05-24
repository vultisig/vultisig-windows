import { Chain } from '@core/chain/Chain'
import { AddressForm } from '@core/ui/address-book/form'
import { AddressFormValues } from '@core/ui/address-book/hooks/useAddressSchema'
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

  const handleCreateAddress = (chain: Chain, values: AddressFormValues) => {
    const { address, title } = values

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
    <AddressForm
      chain={Chain.Bitcoin}
      error={error}
      isPending={isPending}
      onSubmit={handleCreateAddress}
      title={t('add_address')}
      type="add"
    />
  )
}
