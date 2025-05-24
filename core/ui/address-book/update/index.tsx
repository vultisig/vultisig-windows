import { Chain } from '@core/chain/Chain'
import { AddressForm } from '@core/ui/address-book/form'
import { AddressFormValues } from '@core/ui/address-book/hooks/useAddressSchema'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { useUpdateAddressBookItemMutation } from '@core/ui/storage/addressBook'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { useTranslation } from 'react-i18next'

export const UpdateAddressBookItemPage = () => {
  const { t } = useTranslation()
  const [{ values }] = useCoreViewState<'updateAddressBookItem'>()
  const { chain, id } = values
  const { mutate, error, isPending } = useUpdateAddressBookItemMutation()
  const navigateBack = useNavigateBack()

  const handleUpdateAddress = (chain: Chain, values: AddressFormValues) => {
    const { address, title } = values

    mutate(
      { id, fields: { address, chain, title } },
      { onSuccess: navigateBack }
    )
  }

  return (
    <AddressForm
      chain={chain}
      defaultValues={values}
      error={error}
      isPending={isPending}
      onSubmit={handleUpdateAddress}
      title={t('edit_address')}
      type="modify"
    />
  )
}
