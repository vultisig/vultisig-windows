import { useTranslation } from 'react-i18next';

import { AddressBookItem } from '../../../../../lib/types/address-book';
import { Button } from '../../../../../lib/ui/buttons/Button';
import AddressBookListItem from './AddressBookListItem/AddressBookListItem';
import { Container, Main } from './AddressesListView.styles';

type AddressesListViewProps = {
  addressBookItems: AddressBookItem[];
  onOpenAddAddressView: () => void;
  isEditModeOn: boolean;
};

const AddressesListView = ({
  addressBookItems,
  onOpenAddAddressView,
  isEditModeOn,
}: AddressesListViewProps) => {
  const { t } = useTranslation();

  const handleDeleteAddress = (id: string) => {
    // TODO: @antonio to implement when BE is ready
    console.log('## id', id);
  };

  return (
    <Container>
      <Main>
        {addressBookItems.map(({ address, id, title, chain }) => (
          <AddressBookListItem
            key={id}
            id={id}
            title={title}
            address={address}
            chain={chain}
            isEditModeOn={isEditModeOn}
            handleDeleteAddress={handleDeleteAddress}
          />
        ))}
      </Main>
      <Button onClick={onOpenAddAddressView}>
        {t('vault_settings_address_book_add_addresses_button')}
      </Button>
    </Container>
  );
};

export default AddressesListView;
