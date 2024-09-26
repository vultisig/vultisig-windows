import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { UnstyledButton } from '../../../lib/ui/buttons/UnstyledButton';
import SquareAndPencilIcon from '../../../lib/ui/icons/SquareAndPencilIcon';
import { VStack } from '../../../lib/ui/layout/Stack';
import { Text } from '../../../lib/ui/text';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { PageSlice } from '../../../ui/page/PageSlice';
import { useAddressBookItemsQuery } from '../../../vault/queries/useAddressBookItemsQuery';
import AddAddressView from './components/addAddressForm/AddAddressForm';
import AddressesListView from './components/addressesListView/AddressesListView';
import EmptyAddressesView from './components/emptyAddressesView/EmptyAddressesView';

const AddressBookSettingsPage = () => {
  const [isAddAddressViewOpen, setIsAddAddressViewOpen] = useState(false);
  const [isEditModeOn, setIsEditModeOn] = useState(false);
  const { t } = useTranslation();
  const { data: addressBookItems, isFetching: isFetchingAddressBookItems } =
    useAddressBookItemsQuery();
  const handleOpenAddAddressView = () => {
    setIsAddAddressViewOpen(true);
  };
  const handleEditToggle = () => setIsEditModeOn(!isEditModeOn);
  const isAddressBookEmpty = addressBookItems.length === 0 || !addressBookItems;
  let isAddressBookListShown = false;

  let pageContent;
  switch (true) {
    case isFetchingAddressBookItems:
      pageContent = <Text>Loading...</Text>;
      break;
    case isAddAddressViewOpen:
      pageContent = (
        <AddAddressView onClose={() => setIsAddAddressViewOpen(false)} />
      );
      break;
    case isAddressBookEmpty:
      pageContent = (
        <EmptyAddressesView onOpenAddAddressView={handleOpenAddAddressView} />
      );
      break;
    case !isAddressBookEmpty:
      pageContent = (
        <AddressesListView
          addressBookItems={addressBookItems}
          onOpenAddAddressView={handleOpenAddAddressView}
          isEditModeOn={isEditModeOn}
        />
      );
      isAddressBookListShown = true;
      break;
    default:
      pageContent = null;
  }

  return (
    <VStack flexGrow gap={16}>
      <PageHeader
        primaryControls={
          <PageHeaderBackButton
            onClick={
              isAddAddressViewOpen
                ? () => setIsAddAddressViewOpen(false)
                : undefined
            }
          />
        }
        title={
          <PageHeaderTitle>
            {t(
              isAddAddressViewOpen
                ? 'vault_settings_address_book_add_addresses_title'
                : 'vault_settings_address_book'
            )}
          </PageHeaderTitle>
        }
        secondaryControls={
          isAddressBookListShown &&
          (isEditModeOn ? (
            <UnstyledButton onClick={handleEditToggle}>
              <SquareAndPencilIcon />
            </UnstyledButton>
          ) : (
            <UnstyledButton onClick={handleEditToggle}>
              <Text color="contrast" size={16} weight={700}>
                {t('done')}
              </Text>
            </UnstyledButton>
          ))
        }
      />
      <PageSlice gap={16} flexGrow={true}>
        {pageContent}
      </PageSlice>
    </VStack>
  );
};

export default AddressBookSettingsPage;
