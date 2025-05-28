import {
  AddressBookForm,
  AddressBookFormValues,
} from '@core/ui/address-book/form'
import { useCreateAddressBookItem } from '@core/ui/address-book/hooks/useCreateAddressBookItem'
import { useTranslation } from 'react-i18next'

export const CreateAddressBookItemPage = () => {
  const { t } = useTranslation()
  const { createAddressBookItem, error, isPending } = useCreateAddressBookItem()

  const handleSubmit = (values: AddressBookFormValues) => {
    createAddressBookItem(values)
  }

  return (
    <AddressBookForm
      error={error}
      isPending={isPending}
      onSubmit={handleSubmit}
      title={t('add_address')}
    />
  )
}
