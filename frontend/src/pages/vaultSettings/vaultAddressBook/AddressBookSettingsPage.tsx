import { useState } from 'react';

import { VStack } from '../../../lib/ui/layout/Stack';
import { Text } from '../../../lib/ui/text';
import { PageSlice } from '../../../ui/page/PageSlice';
import { useAddressBookItemsQuery } from '../../../vault/queries/useAddressBookItemsQuery';
import AddAddressView from './components/addAddressForm/AddAddressForm';
import AddressesListView from './components/addressesListView/AddressesListView';
import EmptyAddressesView from './components/emptyAddressesView/EmptyAddressesView';

const AddressBookSettingsPage = () => {
  const [isAddAddressViewOpen, setIsAddAddressViewOpen] = useState(false);
  const [isEditModeOn, setIsEditModeOn] = useState(false);
  const { data: addressBookItems, isFetching: isFetchingAddressBookItems } =
    useAddressBookItemsQuery();

  const handleOpenAddAddressView = () => {
    setIsAddAddressViewOpen(true);
  };
  const handleEditToggle = () => setIsEditModeOn(!isEditModeOn);
  const isAddressBookEmpty = addressBookItems.length === 0;

  const componentMap = {
    loading: <Text>Loading...</Text>,
    addAddress: (
      <AddAddressView onClose={() => setIsAddAddressViewOpen(false)} />
    ),
    empty: (
      <EmptyAddressesView onOpenAddAddressView={handleOpenAddAddressView} />
    ),
    list: (
      <AddressesListView
        onEditModeToggle={handleEditToggle}
        onOpenAddAddressView={handleOpenAddAddressView}
        isEditModeOn={isEditModeOn}
      />
    ),
  };

  const getPageContent = () => {
    if (isFetchingAddressBookItems) return componentMap.loading;
    if (isAddAddressViewOpen) return componentMap.addAddress;
    if (isAddressBookEmpty) return componentMap.empty;
    return componentMap.list;
  };

  return (
    <VStack flexGrow gap={16}>
      <PageSlice gap={16} flexGrow={true}>
        {getPageContent()}
      </PageSlice>
    </VStack>
  );
};

export default AddressBookSettingsPage;
