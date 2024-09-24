import {
  PersistentStateKey,
  usePersistentState,
} from '../../../state/persistentState';
import { useStateCorrector } from '../../ui/state/useStateCorrector';
import { isValidAddress } from './utils/isValidAddress';

export type AddressBookEntry = {
  address: string;
  coinSymbol: string;
  title: string;
};

export const useAddressBook = () => {
  const [addresses, setAddresses] = useStateCorrector(
    usePersistentState<AddressBookEntry[]>(PersistentStateKey.AddressBook, []),
    addressBookEntries =>
      addressBookEntries.filter(addressBookEntry =>
        isValidAddress(addressBookEntry.address, addressBookEntry.coinSymbol)
      )
  );

  const addAddress = (addressBookEntry: AddressBookEntry) => {
    const { address, coinSymbol } = addressBookEntry;
    const doesAddressExist = addresses.some(
      addressBookEntry => addressBookEntry.address === address
    );

    if (doesAddressExist || !isValidAddress(address, coinSymbol)) {
      return;
    }

    setAddresses([...addresses, addressBookEntry]);
  };

  return {
    addresses,
    addAddress,
    removeAddress: (address: string) =>
      setAddresses(
        addresses.filter(
          addressBookEntry => addressBookEntry.address !== address
        )
      ),
  };
};
