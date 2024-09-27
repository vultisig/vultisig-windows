import { Coin } from '../coin';

export type AddAddressBookItem = {
  address: string;
  coin: Coin;
  title: string;
};

export type AddressBookItem = {
  id: string;
  address: string;
  chain: string;
  title: string;
  order: number;
};
