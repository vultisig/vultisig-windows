import { Chain } from '@core/chain/Chain'
import { useCreateAddressBookItemMutation } from '@core/ui/storage/addressBook'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { Text } from '@lib/ui/text'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { v4 as uuidv4 } from 'uuid'

import { ChainInput } from '../../../../../chain/inputs/ChainInput'
import { AddressBookPageHeader } from '../../AddressSelector.styles'
import {
  AddressFormValues,
  useAddressSchema,
} from '../../hooks/useAddressSchema'
import {
  AddButton,
  Container,
  Form,
  FormField,
  FormFieldLabel,
  FormInput,
} from './AddAddressForm.styles'

type AddAddressFormProps = {
  onClose: () => void
}

const AddAddressForm = ({ onClose }: AddAddressFormProps) => {
  const { t } = useTranslation()

  const [chain, setChain] = useState<Chain>(Chain.Bitcoin)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty, isLoading, isValidating },
  } = useAddressSchema({
    type: 'add',
    chain,
  })

  const {
    mutate: addAddressBookItem,
    isPending: isAddAddressBookAddressPending,
    error: addAddressBookAddressError,
  } = useCreateAddressBookItemMutation()

  const handleAddAddress = (data: AddressFormValues) => {
    const { address, title } = data

    addAddressBookItem(
      {
        id: uuidv4(),
        title,
        address,
        chain,
      },
      {
        onSuccess: onClose,
      }
    )
  }

  return (
    <>
      <AddressBookPageHeader
        data-testid="AddAddressForm-AddressBookPageHeader"
        primaryControls={<PageHeaderBackButton onClick={onClose} />}
        title={<PageHeaderTitle>{t('add_address')}</PageHeaderTitle>}
      />

      <Container>
        <Form onSubmit={handleSubmit(handleAddAddress)}>
          <ChainInput value={chain} onChange={setChain} />

          <div>
            <FormFieldLabel htmlFor="title">
              {t('vault_settings_address_book_address_title_field')}
            </FormFieldLabel>
            <FormField>
              <FormInput
                id="title"
                {...register('title')}
                placeholder={t(
                  'vault_settings_address_book_address_placeholder'
                )}
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
                placeholder={t(
                  'vault_settings_address_book_address_placeholder'
                )}
              />
            </FormField>
            {errors.address && (
              <Text color="danger" size={12}>
                {errors.address.message}
              </Text>
            )}
          </div>
        </Form>
        <div>
          <AddButton
            isLoading={
              isLoading || isValidating || isAddAddressBookAddressPending
            }
            isDisabled={!isValid || !isDirty}
            onClick={handleSubmit(handleAddAddress)}
          >
            {t('vault_settings_address_book_save_addresses_button')}
          </AddButton>
          {addAddressBookAddressError && (
            <Text color="danger" size={14}>
              {extractErrorMsg(addAddressBookAddressError)}
            </Text>
          )}
        </div>
      </Container>
    </>
  )
}

export default AddAddressForm
