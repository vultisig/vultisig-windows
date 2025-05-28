import { AddressBookItem } from '@core/ui/address-book/model'
import {
  useAddressBookItemOrders,
  useCreateAddressBookItemMutation,
} from '@core/ui/storage/addressBook'
import { useNavigate } from '@lib/ui/navigation/hooks/useNavigate'
import { getLastItemOrder } from '@lib/utils/order/getLastItemOrder'
import { v4 as uuidv4 } from 'uuid'

export const useCreateAddressBookItem = () => {
  const navigate = useNavigate()
  const addressBookItemOrders = useAddressBookItemOrders()
  const { mutate, error, isPending } = useCreateAddressBookItemMutation()

  const createAddressBookItem = (
    values: Pick<AddressBookItem, 'address' | 'chain' | 'title'>
  ) => {
    mutate(
      {
        ...values,
        id: uuidv4(),
        order: getLastItemOrder(addressBookItemOrders),
      },
      { onSuccess: () => navigate({ id: 'addressBook' }) }
    )
  }

  return {
    createAddressBookItem,
    error,
    isPending,
  }
}
