import { WalletCore } from '@trustwallet/wallet-core';
import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core';

import { Chain } from '../../../model/chain';
import { AddressService } from '../AddressService';
import { IAddressService } from '../IAddressService';

export class AddressServiceTon
  extends AddressService
  implements IAddressService
{
  constructor(chain: Chain, walletCore: WalletCore) {
    super(chain, walletCore);
  }

  async getPublicKey(
    _publicKeyECDSA: string,
    publicKeyEdDSA: string
  ): Promise<PublicKey> {
    return this.walletCore.PublicKey.createWithData(
      Buffer.from(publicKeyEdDSA, 'hex'),
      this.walletCore.PublicKeyType.ed25519
    );
  }
}
