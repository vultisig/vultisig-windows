import { useTranslation } from 'react-i18next';

import { useAddressBook } from '../../../lib/hooks/useAddressBook';
import { VStack } from '../../../lib/ui/layout/Stack';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { PageSlice } from '../../../ui/page/PageSlice';
import AddressesListView from './components/addressesListView/AddressesListView';
import EmptyAddressesView from './components/emptyAddressesView/EmptyAddressesView';

const AddressBookSettingsPage = () => {
  const { t } = useTranslation();
  const { addresses } = useAddressBook();

  let pageContent = null;

  if (addresses.length === 0) {
    pageContent = <EmptyAddressesView />;
  }

  if (addresses.length > 0) {
    pageContent = <AddressesListView addresses={addresses} />;
  }

  return (
    <VStack flexGrow gap={16}>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={
          <PageHeaderTitle>{t('vault_settings_address_book')}</PageHeaderTitle>
        }
      />
      <PageSlice gap={16} flexGrow={true}>
        {pageContent}
      </PageSlice>
    </VStack>
  );
};

export default AddressBookSettingsPage;
