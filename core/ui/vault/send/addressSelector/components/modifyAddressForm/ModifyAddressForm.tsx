import { Chain } from '@core/chain/Chain'
import { AddressBookItem } from '@core/ui/addressBook/AddressBookItem'
import { useUpdateAddressBookItemMutation } from '@core/ui/storage/addressBook'
import { Button } from '@lib/ui/buttons/Button'
import { Text } from '@lib/ui/text'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ChainInput } from '../../../../../chain/inputs/ChainInput'
import {
  AddressFormValues,
  useAddressSchema,
} from '../../hooks/useAddressSchema'
import {
  ButtonWrapper,
  Container,
  Form,
  FormField,
  FormFieldLabel,
  FormInput,
} from './ModifyAddressForm.styles'

type ModifyAddressFormProps = {
  onClose: () => void
  addressBookItem: AddressBookItem
}

const ModifyAddressForm = ({
  onClose,
  addressBookItem,
}: ModifyAddressFormProps) => {
  const { t } = useTranslation()
  const [chain, setChain] = useState<Chain>(addressBookItem.chain)
  const { address, title, id } = addressBookItem

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty, isLoading, isValidating },
  } = useAddressSchema({
    type: 'modify',
    defaultValues: {
      title: title,
      address: address,
    },
    chain,
  })

  const {
    mutate: updateAddressBookItem,
    isPending: isAddAddressBookAddressPending,
    error: addAddressBookAddressError,
  } = useUpdateAddressBookItemMutation()

  const handleModifyAddress = (data: AddressFormValues) => {
    const { address, title } = data
    updateAddressBookItem(
      {
        id,
        fields: {
          address,
          title,
          chain,
        },
      },
      {
        onSuccess: onClose,
      }
    )
  }

  return (
    <Container>
      <Form onSubmit={handleSubmit(handleModifyAddress)}>
        <ChainInput value={chain} onChange={setChain} />

        <div>
          <FormFieldLabel htmlFor="title">
            {t('vault_settings_address_book_address_title_field')}
          </FormFieldLabel>
          <FormField>
            <FormInput
              id="title"
              {...register('title')}
              placeholder={t('vault_settings_address_book_address_placeholder')}
            />
          </FormField>
          {errors.title && (
            <Text color="danger" size={12}>
              {errors.title.message}
            </Text>
          )}
        </div>
        <div>
          <FormFieldLabel htmlFor="address">{t('address')}</FormFieldLabel>
          <FormField>
            <FormInput
              id="address"
              {...register('address')}
              placeholder={t('vault_settings_address_book_address_placeholder')}
            />
          </FormField>
          {errors.address && (
            <Text color="danger" size={12}>
              {errors.address.message}
            </Text>
          )}
        </div>
      </Form>
      <ButtonWrapper>
        <Button
          isLoading={
            isLoading || isValidating || isAddAddressBookAddressPending
          }
          isDisabled={!isValid || !isDirty}
          onClick={handleSubmit(handleModifyAddress)}
        >
          {t('vault_settings_address_book_save_addresses_button')}
        </Button>
        {addAddressBookAddressError && (
          <Text color="danger" size={12}>
            {extractErrorMsg(addAddressBookAddressError)}
          </Text>
        )}
      </ButtonWrapper>
    </Container>
  )
}

export default ModifyAddressForm
