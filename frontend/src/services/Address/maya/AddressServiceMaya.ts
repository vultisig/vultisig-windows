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

  async deriveAddressFromPublicKey(
    publicKeyECDSA: string,
    publicKeyEdDSA: string,
    hexChainCode: string
  ): Promise<string> {
    const walletCore = this.walletCore;
    const publicKey = await this.getPublicKey(
      publicKeyECDSA,
      publicKeyEdDSA,
      hexChainCode
    );

    const address = walletCore.AnyAddress.createBech32WithPublicKey(
      publicKey,
      walletCore.CoinType.thorchain,
      'maya'
    );

    return address.description();
  }
}