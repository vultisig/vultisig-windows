import { useTranslation } from 'react-i18next';

import { AddressBookItem } from '../../../../../lib/types/address-book';
import { Button } from '../../../../../lib/ui/buttons/Button';
import {
  AddressBookListItem,
  ColumnOneBothRowsItem,
  ColumnThreeRowOneItem,
  ColumnTwoRowOneItem,
  ColumnTwoRowTwoItem,
  Container,
} from './AddressesListView.styles';

type AddressesListViewProps = {
  addressBookItems: AddressBookItem[];
  onOpenAddAddressView: () => void;
};

const AddressesListView = ({
  addressBookItems,
  onOpenAddAddressView,
}: AddressesListViewProps) => {
  const { t } = useTranslation();

  return (
    <Container>
      <div>
        {addressBookItems.map(({ address, id, title, chain }) => (
          <AddressBookListItem key={id}>
            {/* TODO: @antonio to implement icon when chain is available from BE */}
            <ColumnOneBothRowsItem color="primary">
              {title}
            </ColumnOneBothRowsItem>
            <ColumnTwoRowOneItem color="contrast">{title}</ColumnTwoRowOneItem>
            <ColumnTwoRowTwoItem color="contrast">
              {address}
            </ColumnTwoRowTwoItem>
            <ColumnThreeRowOneItem color="shy">{chain}</ColumnThreeRowOneItem>
          </AddressBookListItem>
        ))}
      </div>
      <Button onClick={onOpenAddAddressView}>
        {t('vault_settings_address_book_add_addresses_button')}
      </Button>
    </Container>
  );
};

export default AddressesListView;
