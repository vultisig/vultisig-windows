import { IAddressService } from '../IAddressService';
import { AddressService } from '../AddressService';
import { Chain } from '../../../model/chain';
import { WalletCore } from '@trustwallet/wallet-core';

export class AddressServiceThorchain
  extends AddressService
  implements IAddressService
{
  constructor(chain: Chain, walletCore: WalletCore) {
    super(chain, walletCore);
  }
}
