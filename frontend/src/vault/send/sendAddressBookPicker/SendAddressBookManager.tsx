import { useState } from 'react';

import { Match } from '../../../lib/ui/base/Match';
import { Text } from '../../../lib/ui/text';
import { PageSlice } from '../../../ui/page/PageSlice';
import { useAddressBookItemsQuery } from '../../queries/useAddressBookItemsQuery';
import AddAddressView from './components/addAddressForm/AddAddressForm';
import AddressesListView from './components/addressesListView/AddressesListView';
import EmptyAddressesView from './components/emptyAddressesView/EmptyAddressesView';
import { Wrapper } from './SendAddressBookManager.styles';

type SendAddressBookManagerProps = {
  onAddressClick: (address: string) => void;
  onClose: () => void;
};

const SendAddressBookManager = ({
  onAddressClick,
  onClose,
}: SendAddressBookManagerProps) => {
  const [isAddAddressViewOpen, setIsAddAddressViewOpen] = useState(false);
  const [isEditModeOn, setIsEditModeOn] = useState(false);
  const { data: addressBookItems, isFetching: isFetchingAddressBookItems } =
    useAddressBookItemsQuery();

  const handleOpenAddAddressView = () => {
    setIsAddAddressViewOpen(true);
  };

  return (
    <Wrapper flexGrow gap={16}>
      <PageSlice gap={16} flexGrow={true}>
        <Match
          value={
            isFetchingAddressBookItems
              ? 'loading'
              : isAddAddressViewOpen
                ? 'addAddress'
                : addressBookItems.length === 0
                  ? 'empty'
                  : 'list'
          }
          loading={() => <Text>Loading...</Text>}
          addAddress={() => (
            <AddAddressView onClose={() => setIsAddAddressViewOpen(false)} />
          )}
          empty={() => (
            <EmptyAddressesView
              onOpenAddAddressView={handleOpenAddAddressView}
            />
          )}
          list={() => (
            <AddressesListView
              onClick={onAddressClick}
              onClose={onClose}
              onEditModeToggle={() => setIsEditModeOn(!isEditModeOn)}
              onOpenAddAddressView={handleOpenAddAddressView}
              isEditModeOn={isEditModeOn}
            />
          )}
        />
      </PageSlice>
    </Wrapper>
  );
};

export default SendAddressBookManager;
