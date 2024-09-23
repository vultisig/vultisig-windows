import {
  PersistentStateKey,
  usePersistentState,
} from '../../../state/persistentState';
import { useStateCorrector } from '../../ui/state/useStateCorrector';

export const useAddressBook = () => {
  const [addresses, setAddresses] = useStateCorrector(
    usePersistentState<string[]>(PersistentStateKey.AddressBook, []),
    addresses => addresses.filter(Boolean)
  );

  return {
    addresses,
    addAddress: (newAddress: string) =>
      setAddresses([...addresses, newAddress]),
    removeAddress: (address: string) =>
      setAddresses(addresses.filter(a => a !== address)),
  };
};
