import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';

import { Text } from '../../../../../lib/ui/text';
import { extractError } from '../../../../../lib/utils/error/extractError';
import { Chain } from '../../../../../model/chain';
import { PageHeaderBackButton } from '../../../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../../../ui/page/PageHeaderTitle';
import { useAddAddressBookItemMutation } from '../../../../../vault/mutations/useAddAddressBookItemMutation';
import { useAssertCurrentVaultCoins } from '../../../../../vault/state/useCurrentVault';
import { AddressBookPageHeader } from '../../AddressBookSettingsPage.styles';
import { AddressFormValues, addressSchema } from '../../schemas/addressSchema';
import {
  AddButton,
  CoinOption,
  Container,
  customSelectMenu,
  customSelectStyles,
  Form,
  FormField,
  FormFieldLabel,
  FormInput,
} from './AddAddressForm.styles';

type AddAddressFormProps = {
  onClose: () => void;
};

const AddAddressForm = ({ onClose }: AddAddressFormProps) => {
  const coins = useAssertCurrentVaultCoins();
  const { t } = useTranslation();

  const coinOptions = useMemo(() => {
    return coins.map((coin, index) => ({
      value: coin.id,
      label: coin.ticker,
      logo: coin.logo,
      isLastOption: index === coins.length - 1,
    }));
  }, [coins]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty, isLoading, isValidating },
    control,
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    mode: 'onBlur',
    defaultValues: {
      coinId: coinOptions[0].value,
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
    const { address, coinId, title } = data;
    const coin = coins.find(coin => coin.id === coinId);

    if (!coin) {
      return;
    }

    addAddressBookItem({
      addressBookItem: {
        address,
        coin: coin,
        title,
      },
      chain: coin.chain as Chain,
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
              name="coinId"
              control={control}
              render={({ field }) => (
                <Select<CoinOption>
                  value={
                    coinOptions.find(option => option.value === field.value) ||
                    null
                  }
                  defaultValue={coinOptions[0]}
                  onChange={selectedOption => {
                    field.onChange(selectedOption?.value);
                  }}
                  onBlur={field.onBlur}
                  options={coinOptions}
                  components={{ Menu: customSelectMenu }}
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
              {extractError(addAddressBookAddressError)}
            </Text>
          )}
        </div>
      </Container>
    </>
  );
};

export default AddAddressForm;