/* eslint-disable */

import { Chain } from '../../../model/chain';
import { IAddressService } from '../IAddressService';

export class AddressServiceEvm implements IAddressService {
  resolveDomainAddress(address: string, chain: Chain): Promise<string> {
    throw new Error('Method not implemented.');
  }
  validateAddress(address: string, chain: Chain): boolean {
    throw new Error('Method not implemented.');
  }
}
