import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';

import { AddressBookItem } from '../../../../../lib/types/address-book';
import { Button } from '../../../../../lib/ui/buttons/Button';
import { Text } from '../../../../../lib/ui/text';
import { extractError } from '../../../../../lib/utils/error/extractError';
import { Chain } from '../../../../../model/chain';
import { useAddAddressBookItemMutation } from '../../../../../vault/mutations/useAddAddressBookItemMutation';
import { useAssertCurrentVaultCoins } from '../../../../../vault/state/useCurrentVault';
import { AddressFormValues, addressSchema } from '../../schemas/addressSchema';
import {
  CoinOption,
  Container,
  customSelectMenu,
  customSelectStyles,
  Form,
  FormField,
  FormFieldLabel,
  FormInput,
} from './ModifyAddressForm.styles';

type ModifyAddressFormProps = {
  onClose: () => void;
  defaultValues: AddressBookItem;
};

const ModifyAddressForm = ({
  onClose,
  defaultValues,
}: ModifyAddressFormProps) => {
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

  // TODO: @antonio to implement when BE returns "coin" as part of each account
  // const coinIdForDefaultValues =
  //   useMemo(
  //     () => coins.find(coin => coin.id === defaultValues.coin.id)?.id,
  //     [coins, defaultValues.coin.id]
  //   ) || '';

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty, isLoading, isValidating },
    control,
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    mode: 'onBlur',
    defaultValues: {
      ...defaultValues,
      coinId: '1',
    },
  });

  const {
    mutate: addAddressBookItem,
    isPending: isAddAddressBookAddressPending,
    error: addAddressBookAddressError,
  } = useAddAddressBookItemMutation({
    onSuccess: onClose,
  });

  const handleModifyAddress = (data: AddressFormValues) => {
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
    <Container>
      <Form onSubmit={handleSubmit(handleModifyAddress)}>
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
          <FormFieldLabel htmlFor="address">
            {t('vault_settings_address_book_address_address_field')}
          </FormFieldLabel>
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
      <Button
        isLoading={isLoading || isValidating || isAddAddressBookAddressPending}
        isDisabled={!isValid || !isDirty}
        onClick={handleSubmit(handleModifyAddress)}
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

export default ModifyAddressForm;