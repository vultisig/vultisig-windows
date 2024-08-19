/* eslint-disable */
import { IAddressService } from '../IAddressService';
import { AddressService } from '../AddressService';
import { WalletCore } from '@trustwallet/wallet-core';
import { Chain } from '../../../model/chain';

export class AddressServiceMaya
  extends AddressService
  implements IAddressService
{
  constructor(chain: Chain, walletCore: WalletCore) {
    super(chain, walletCore);
  }

  // TODO: Implement this method correctly
  async deriveAddressFromPublicKey(
    publicKey: any,
    chain: Chain
  ): Promise<string> {
    const walletCore = this.walletCore;
    const address = walletCore.AnyAddress.createBech32(
      publicKey,
      walletCore.CoinType.thorchain,
      'maya'
    );

    console.log('Derived address:', address);
    return '';
  }
}
