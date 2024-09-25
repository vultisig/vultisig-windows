import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';

import { Button } from '../../../../../lib/ui/buttons/Button';
import { Text } from '../../../../../lib/ui/text';
import { extractError } from '../../../../../lib/utils/error/extractError';
import { Chain } from '../../../../../model/chain';
import { useAddAddressBookItemMutation } from '../../../../../vault/mutations/useAddAddressBookItemMutation';
import { useAssertCurrentVaultCoins } from '../../../../../vault/state/useCurrentVault';
import {
  CoinOption,
  Container,
  customSelectMenu,
  customSelectStyles,
  Form,
  FormField,
  FormInput,
} from './AddAddressForm.styles';
import { AddressFormValues, addressSchema } from './schemas/addAddressSchema';

type AddAddressFormProps = {
  onClose: () => void;
};

const AddAddressForm = ({ onClose }: AddAddressFormProps) => {
  const coins = useAssertCurrentVaultCoins();
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty, isLoading, isValidating },
    control,
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    mode: 'onBlur',
  });

  const {
    mutate: addAddressBookItem,
    isPending: isAddAddressBookAddressPending,
    error: addAddressBookAddressError,
    isSuccess,
  } = useAddAddressBookItemMutation();

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

  useEffect(() => {
    if (isSuccess) {
      onClose();
    }
  }, [isSuccess, onClose]);

  const coinOptions = coins.map(coin => ({
    value: coin.id,
    label: coin.ticker,
  }));

  return (
    <Container>
      <Form onSubmit={handleSubmit(handleAddAddress)}>
        <FormField>
          <Controller
            name="coinId"
            control={control}
            render={({ field }) => (
              <Select<CoinOption>
                {...field}
                value={coinOptions.find(option => option.value === field.value)}
                defaultValue={coinOptions[0]}
                options={coinOptions}
                components={{ Menu: customSelectMenu }}
                styles={customSelectStyles}
                placeholder="Select cryptocurrency"
                onChange={selectedOption =>
                  field.onChange(selectedOption?.value)
                }
              />
            )}
          />
        </FormField>

        <FormField>
          <label htmlFor="title">{t('address_title')}</label>
          <FormInput
            id="title"
            {...register('title')}
            placeholder={t('enter_title')}
          />
          {errors.title && <p>{errors.title.message}</p>}
        </FormField>
        <FormField>
          <label htmlFor="address">{t('address')}</label>
          <FormInput
            id="address"
            {...register('address')}
            placeholder={t('enter_address')}
          />
          {errors.address && <p>{errors.address.message}</p>}
        </FormField>
      </Form>
      <Button
        isLoading={isLoading || isValidating || isAddAddressBookAddressPending}
        disabled={!isValid || !isDirty}
        onClick={handleSubmit(handleAddAddress)}
      >
        {t('vault_settings_address_book_save_addresses_button')}
      </Button>
      {addAddressBookAddressError && (
        <Text color="danger" size={12}>
          {extractError(addAddressBookAddressError)}
        </Text>
      )}
    </Container>
  );
};

export default AddAddressForm;
