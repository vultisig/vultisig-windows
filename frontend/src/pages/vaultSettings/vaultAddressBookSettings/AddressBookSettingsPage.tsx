import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAddressBook } from '../../../lib/hooks/useAddressBook';
import { VStack } from '../../../lib/ui/layout/Stack';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { PageSlice } from '../../../ui/page/PageSlice';
import { useAssertCurrentVaultCoins } from '../../../vault/state/useCurrentVault';
import AddAddressView from './components/addAddressForm/AddAddressForm';
import AddressesListView from './components/addressesListView/AddressesListView';
import EmptyAddressesView from './components/emptyAddressesView/EmptyAddressesView';

const AddressBookSettingsPage = () => {
  const [isAddAddressViewOpen, setIsAddAddressViewOpen] = useState(false);
  const { t } = useTranslation();
  const { addresses, addAddress } = useAddressBook();
  const coins = useAssertCurrentVaultCoins();

  let pageContent = null;

  if (isAddAddressViewOpen) {
    pageContent = (
      <AddAddressView
        onClose={() => setIsAddAddressViewOpen(false)}
        onAddAddress={addAddress}
        availableCoins={coins}
      />
    );
  } else if (addresses.length === 0) {
    pageContent = (
      <EmptyAddressesView
        onOpenAddAddressView={() => setIsAddAddressViewOpen(true)}
      />
    );
  } else if (addresses.length > 0) {
    pageContent = <AddressesListView addresses={addresses} />;
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
