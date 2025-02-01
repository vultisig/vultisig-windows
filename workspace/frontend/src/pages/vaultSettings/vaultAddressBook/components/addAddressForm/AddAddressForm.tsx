import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { z } from 'zod';

import { Text } from '../../../../../lib/ui/text';
import { extractErrorMsg } from '../../../../../lib/utils/error/extractErrorMsg';
import { Chain } from '../../../../../model/chain';
import { useAssertWalletCore } from '../../../../../providers/WalletCoreProvider';
import { PageHeaderBackButton } from '../../../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../../../ui/page/PageHeaderTitle';
import { useAddAddressBookItemMutation } from '../../../../../vault/mutations/useAddAddressBookItemMutation';
import { useAddressBookItemsQuery } from '../../../../../vault/queries/useAddressBookItemsQuery';
import { AddressBookPageHeader } from '../../AddressBookSettingsPage.styles';
import { getCoinOptions } from '../../helpers/getCoinOptions';
import { getAddressSchema } from '../../schemas/addressSchema';
import {
  AddButton,
  ChainOption,
  Container,
  customSelectMenu,
  customSelectOption,
  customSelectStyles,
  customSingleValue,
  Form,
  FormField,
  FormFieldLabel,
  FormInput,
} from './AddAddressForm.styles';

type AddAddressFormProps = {
  onClose: () => void;
};

const AddAddressForm = ({ onClose }: AddAddressFormProps) => {
  const { data: addressBookItems } = useAddressBookItemsQuery();
  const { t } = useTranslation();
  const chainOptions = useMemo(() => getCoinOptions(), []);
  const walletCore = useAssertWalletCore();
  const addressSchema = getAddressSchema({
    walletCore,
    addressBookItems,
  });

  type AddressFormValues = z.infer<typeof addressSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty, isLoading, isValidating },
    control,
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    mode: 'onBlur',
    defaultValues: {
      chain: chainOptions[0].value,
      title: '',
      address: '',
    },
  });

  const {
    mutate: addAddressBookItem,
    isPending: isAddAddressBookAddressPending,
    error: addAddressBookAddressError,
  } = useAddAddressBookItemMutation({
    onSuccess: onClose,
  });

  const handleAddAddress = (data: AddressFormValues) => {
    const { address, chain, title } = data;

    addAddressBookItem({
      order: addressBookItems.length,
      title,
      address,
      chain: chain as Chain,
    });
  };

  return (
    <>
      <AddressBookPageHeader
        data-testid="AddAddressForm-AddressBookPageHeader"
        primaryControls={<PageHeaderBackButton onClick={onClose} />}
        title={
          <PageHeaderTitle>
            {t('vault_settings_address_book_add_addresses_title')}
          </PageHeaderTitle>
        }
      />

      <Container>
        <Form onSubmit={handleSubmit(handleAddAddress)}>
          <FormField>
            <Controller
              name="chain"
              control={control}
              render={({ field }) => (
                <Select<ChainOption>
                  value={
                    chainOptions.find(option => option.value === field.value) ||
                    null
                  }
                  defaultValue={chainOptions[0]}
                  onChange={selectedOption => {
                    field.onChange(selectedOption?.value);
                  }}
                  onBlur={field.onBlur}
                  options={chainOptions}
                  components={{
                    Menu: customSelectMenu,
                    Option: customSelectOption,
                    SingleValue: customSingleValue,
                  }}
                  styles={customSelectStyles}
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
                placeholder={t(
                  'vault_settings_address_book_address_placeholder'
                )}
              />
            </FormField>
            {errors.title && (
              <Text color="danger" size={12}>
                {t(errors.title.message || '')}
              </Text>
            )}
          </div>
          <div>
            <FormFieldLabel htmlFor="address">
              {t('vault_settings_address_book_address_address_field')}
            </FormFieldLabel>
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
                {t(errors.address.message || '')}
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
              {t(extractErrorMsg(addAddressBookAddressError))}
            </Text>
          )}
        </div>
      </Container>
    </>
  );
};

export default AddAddressForm;
