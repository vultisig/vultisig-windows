import {
  AddressBookForm,
  AddressBookFormValues,
} from '@core/ui/address-book/form'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import {
  useAddressBookItems,
  useUpdateAddressBookItemMutation,
} from '@core/ui/storage/addressBook'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export const UpdateAddressBookItemPage = () => {
  const { t } = useTranslation()
  const [{ id }] = useCoreViewState<'updateAddressBookItem'>()
  const { mutate, error, isPending } = useUpdateAddressBookItemMutation()
  const addressBookItems = useAddressBookItems()
  const navigateBack = useNavigateBack()

  const addressBookItem = useMemo(
    () => addressBookItems.find(item => item.id === id),
    [addressBookItems, id]
  )

  const handleUpdateAddress = (values: AddressBookFormValues) => {
    const { address, chain, title } = values

    mutate(
      { id, fields: { address, chain, title } },
      { onSuccess: navigateBack }
    )
  }

  return (
    <AddressBookForm
      defaultValues={addressBookItem}
      error={error}
      isPending={isPending}
      onSubmit={handleUpdateAddress}
      title={t('edit_address')}
    />
  )
}
