import {
  AddressBookForm,
  AddressBookFormValues,
} from '@core/ui/address-book/form'
import { useUpdateAddressBookItem } from '@core/ui/address-book/hooks/useUpdateAddressBookItem'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { useAddressBookItems } from '@core/ui/storage/addressBook'
import { useTranslation } from 'react-i18next'

export const UpdateAddressBookItemPage = () => {
  const { t } = useTranslation()
  const [state] = useCoreViewState<'updateAddressBookItem'>()
  const addressBookItems = useAddressBookItems()
  const { updateAddressBookItem, error, isPending } = useUpdateAddressBookItem()

  const addressBookItem = addressBookItems.find(item => item.id === state?.id)

  const handleSubmit = (values: AddressBookFormValues) => {
    if (state?.id) {
      updateAddressBookItem(state.id, values)
    }
  }

  return (
    <AddressBookForm
      defaultValues={addressBookItem}
      error={error}
      isPending={isPending}
      onSubmit={handleSubmit}
      title={t('edit_address')}
    />
  )
}
