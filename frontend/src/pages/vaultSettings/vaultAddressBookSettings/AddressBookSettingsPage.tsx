import { useState } from 'react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const { data: addressBookItems, isFetching } = useAddressBookItemsQuery();

  let pageContent = null;

  if (isFetching) {
    return <Text>Loading...</Text>;
  } else if (isAddAddressViewOpen) {
    pageContent = (
      <AddAddressView onClose={() => setIsAddAddressViewOpen(false)} />
    );
  } else if (addressBookItems.length === 0) {
    pageContent = (
      <EmptyAddressesView
        onOpenAddAddressView={() => setIsAddAddressViewOpen(true)}
      />
    );
  } else if (addressBookItems.length > 0) {
    pageContent = <AddressesListView addressBookItems={addressBookItems} />;
  }

  return (
    <VStack flexGrow gap={16}>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={
          <PageHeaderTitle>
            {t(
              isAddAddressViewOpen
                ? 'vault_settings_address_book_add_addresses_title'
                : 'vault_settings_address_book'
            )}
          </PageHeaderTitle>
        }
      />
      <PageSlice gap={16} flexGrow={true}>
        {pageContent}
      </PageSlice>
    </VStack>
  );
};

export default AddressBookSettingsPage;
