/* eslint-disable */

import { initWasm } from '@trustwallet/wallet-core';
import { IAddressService } from '../IAddressService';
import { AddressService } from '../AddressService';
import { Chain } from '../../../model/chain';

export class AddressServicePolkadot
  extends AddressService
  implements IAddressService
{
  constructor(chain: Chain) {
    super(chain);
  }

  async getPublicKey(
    _publicKeyECDSA: string,
    publicKeyEdDSA: string
  ): Promise<any> {
    const walletCore = await initWasm();
    return walletCore.PublicKey.createWithData(
      Buffer.from(publicKeyEdDSA, 'hex'),
      walletCore.PublicKeyType.ed25519
    );
  }
}
