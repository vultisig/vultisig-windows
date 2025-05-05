import { Chain } from '@core/chain/Chain'
import { AddressBookItem } from '@core/ui/addressBook/AddressBookItem'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import {
  useAddressBookItems,
  useUpdateAddressBookItemMutation,
} from '@core/ui/storage/addressBook'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@lib/ui/buttons/Button'
import { Text } from '@lib/ui/text'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import Select from 'react-select'
import { z } from 'zod'

import { getCoinOptions } from '../../helpers/getCoinOptions'
import { getAddressSchema } from '../../schemas/addressSchema'
import {
  customSelectOption,
  customSingleValue,
} from '../addAddressForm/AddAddressForm.styles'
import {
  ButtonWrapper,
  CoinOption,
  Container,
  customSelectMenu,
  customSelectStyles,
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
  const chainOptions = useMemo(() => getCoinOptions(), [])
  const addressBookItems = useAddressBookItems()
  const walletCore = useAssertWalletCore()
  const addressSchema = getAddressSchema({
    walletCore,
    addressBookItems,
    t,
  })
  type AddressFormValues = z.infer<typeof addressSchema>

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty, isLoading, isValidating },
    control,
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    mode: 'onBlur',
    defaultValues: {
      title: addressBookItem.title,
      address: addressBookItem.address,
      chain: addressBookItem.chain,
    },
  })

  const {
    mutate: updateAddressBookItem,
    isPending: isAddAddressBookAddressPending,
    error: addAddressBookAddressError,
  } = useUpdateAddressBookItemMutation()

  const handleModifyAddress = (data: AddressFormValues) => {
    const { address, chain, title } = data
    updateAddressBookItem(
      {
        id: addressBookItem.id,
        fields: {
          address,
          title,
          chain: chain as Chain,
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
        <FormField>
          <Controller
            name="chain"
            control={control}
            render={({ field }) => (
              <Select<CoinOption>
                value={
                  chainOptions.find(option => option.value === field.value) ||
                  null
                }
                defaultValue={chainOptions[0]}
                onChange={selectedOption => {
                  field.onChange(selectedOption?.value)
                }}
                onBlur={field.onBlur}
                options={chainOptions}
                components={{
                  Menu: customSelectMenu,
                  Option: customSelectOption,
                  SingleValue: customSingleValue,
                }}
                styles={customSelectStyles}
                placeholder="Select cryptocurrency"
              />
            )}
          />
        </FormField>

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
