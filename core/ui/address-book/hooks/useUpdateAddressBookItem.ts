import { AddressBookItem } from '@core/ui/address-book/model'
import { useUpdateAddressBookItemMutation } from '@core/ui/storage/addressBook'
import { useNavigate } from '@lib/ui/navigation/hooks/useNavigate'

export const useUpdateAddressBookItem = () => {
  const navigate = useNavigate()
  const { mutate, error, isPending } = useUpdateAddressBookItemMutation()

  const updateAddressBookItem = (
    id: string,
    values: Pick<AddressBookItem, 'address' | 'chain' | 'title'>
  ) => {
    mutate(
      {
        id,
        fields: values,
      },
      { onSuccess: () => navigate({ id: 'addressBook' }) }
    )
  }

  return {
    updateAddressBookItem,
    error,
    isPending,
  }
}
