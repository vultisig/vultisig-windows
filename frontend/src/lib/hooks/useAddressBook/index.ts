import {
  PersistentStateKey,
  usePersistentState,
} from '../../../state/persistentState';

export const useAddressBook = () => {
  const [addresses, setAddresses] = usePersistentState<string[]>(
    PersistentStateKey.AddressBook,
    []
  );

  return {
    addresses,
    addAddress: (newAddress: string) =>
      setAddresses([...addresses, newAddress]),
    removeAddress: (address: string) =>
      setAddresses(addresses.filter(a => a !== address)),
  };
};
