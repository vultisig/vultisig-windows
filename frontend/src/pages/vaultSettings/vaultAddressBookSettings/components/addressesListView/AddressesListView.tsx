import { AddressBookItem } from '../../../../../lib/types/address-book';

const AddressesListView = ({
  addressBookItems,
}: {
  addressBookItems: AddressBookItem[];
}) => {
  return <div>{addressBookItems[0].address}</div>;
};

export default AddressesListView;
