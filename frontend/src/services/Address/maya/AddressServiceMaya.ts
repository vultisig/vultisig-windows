/* eslint-disable */
import { IAddressService } from '../IAddressService';
import { AddressService } from '../AddressService';
import { initWasm } from '@trustwallet/wallet-core';
import { Chain } from '../../../model/chain';

export class AddressServiceMaya
  extends AddressService
  implements IAddressService
{
  constructor(chain: Chain) {
    super(chain);
  }

  async deriveAddressFromPublicKey(
    publicKey: any,
    chain: Chain
  ): Promise<string> {
    const walletCore = await initWasm();
    return walletCore.AnyAddress.createBech32(
      publicKey,
      walletCore.CoinType.thorchain,
      'maya'
    ).description.toString();
  }
}
