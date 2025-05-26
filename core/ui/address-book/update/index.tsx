import {
  AddressBookForm,
  AddressBookFormValues,
} from '@core/ui/address-book/form'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { useUpdateAddressBookItemMutation } from '@core/ui/storage/addressBook'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { useTranslation } from 'react-i18next'

export const UpdateAddressBookItemPage = () => {
  const { t } = useTranslation()
  const [{ values }] = useCoreViewState<'updateAddressBookItem'>()
  const { id } = values
  const { mutate, error, isPending } = useUpdateAddressBookItemMutation()
  const navigateBack = useNavigateBack()

  const handleUpdateAddress = (values: AddressBookFormValues) => {
    const { address, chain, title } = values

    mutate(
      { id, fields: { address, chain, title } },
      { onSuccess: navigateBack }
    )
  }

  return (
    <AddressBookForm
      defaultValues={values}
      error={error}
      isPending={isPending}
      onSubmit={handleUpdateAddress}
      title={t('edit_address')}
    />
  )
}
