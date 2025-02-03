import { Chain } from '../../../model/chain';

export type AddressBookItem = {
  id: string;
  address: string;
  chain: Chain;
  title: string;
  order: number;
};
