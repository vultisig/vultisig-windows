/* eslint-disable */
import { IAddressService } from '../IAddressService';
import { AddressService } from '../AddressService';
import { Chain } from '../../../model/chain';

export class AddressServiceThorchain
  extends AddressService
  implements IAddressService
{
  constructor(chain: Chain) {
    super(chain);
  }
}
