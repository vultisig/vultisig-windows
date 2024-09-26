import { AddressBookItem } from '../../../../../lib/types/address-book';

const AddressesListView = ({
  addressBookItems,
}: {
  addressBookItems: AddressBookItem[];
}) => {
  return <div>{addressBookItems.length}</div>;
};

export default AddressesListView;
