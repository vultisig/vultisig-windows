/* eslint-disable */

import { initWasm, WalletCore } from '@trustwallet/wallet-core';
import { IAddressService } from '../IAddressService';
import { AddressService } from '../AddressService';
import { Chain } from '../../../model/chain';

export class AddressServiceSui
  extends AddressService
  implements IAddressService
{
  constructor(chain: Chain, walletCore: WalletCore) {
    super(chain, walletCore);
  }

  async getPublicKey(
    _publicKeyECDSA: string,
    publicKeyEdDSA: string
  ): Promise<any> {
    const walletCore = this.walletCore;
    return walletCore.PublicKey.createWithData(
      Buffer.from(publicKeyEdDSA, 'hex'),
      walletCore.PublicKeyType.ed25519
    );
  }
}
