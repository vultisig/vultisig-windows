/* eslint-disable */

import { initWasm } from '@trustwallet/wallet-core';
import { IAddressService } from '../IAddressService';
import { AddressService } from '../AddressService';

export class AddressServicePolkadot
  extends AddressService
  implements IAddressService
{
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
