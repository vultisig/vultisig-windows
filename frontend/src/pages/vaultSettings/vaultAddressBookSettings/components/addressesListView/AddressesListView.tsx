import { AddressBookEntry } from '../../../../../lib/hooks/useAddressBook';

const AddressesListView = ({
  addresses,
}: {
  addresses: AddressBookEntry[];
}) => {
  return <div>{addresses[0].address}</div>;
};

export default AddressesListView;
