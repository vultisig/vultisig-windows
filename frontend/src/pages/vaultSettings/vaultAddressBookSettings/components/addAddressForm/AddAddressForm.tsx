import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { storage } from '../../../../../../wailsjs/go/models';
import { AddressBookEntry } from '../../../../../lib/hooks/useAddressBook';
import { Button } from '../../../../../lib/ui/buttons/Button';
import { Container, Form, FormField, FormInput } from './AddAddressForm.styles';
import { Address, addressSchema } from './schemas/addAddressSchema';

type AddAddressFormProps = {
  onClose: () => void;
  onAddAddress: (addressBookEntry: AddressBookEntry) => void;
  availableCoins: storage.Coin[];
};

const AddAddressForm = ({
  availableCoins,
  onAddAddress,
  onClose,
}: AddAddressFormProps) => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty, isLoading, isValidating },
  } = useForm<Address>({
    resolver: zodResolver(addressSchema),
    mode: 'onBlur',
  });

  const handleAddAddress = (data: AddressBookEntry) => {
    onAddAddress(data);
    onClose();
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit(handleAddAddress)}>
        <FormField>
          <label htmlFor="coinSymbol">{t('cryptocurrency')}</label>
          <select id="coinSymbol" {...register('coinSymbol')}>
            <option value="">{t('select_cryptocurrency')}</option>
            {availableCoins.map(coin => (
              <option key={coin.ticker} value={coin.ticker}>
                {coin.ticker}
              </option>
            ))}
          </select>
          {errors.coinSymbol && <p>{errors.coinSymbol.message}</p>}
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
        isLoading={isLoading || isValidating}
        disabled={!isValid || !isDirty}
        onClick={handleSubmit(onAddAddress)}
      >
        {t('vault_settings_address_book_save_addresses_button')}
      </Button>
    </Container>
  );
};

export default AddAddressForm;
