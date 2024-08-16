/* eslint-disable */

import { initWasm } from '@trustwallet/wallet-core';
import { Chain } from '../../model/chain';
import { IAddressService } from './IAddressService';
import { CoinServiceFactory } from '../Coin/CoinServiceFactory';
import { GetDerivedPubKey } from '../../../wailsjs/go/tss/TssService';

export class AddressService implements IAddressService {
  private chain: Chain;
  constructor(chain: Chain) {
    this.chain = chain;
  }

  resolveDomainAddress(address: string): Promise<string> {
    throw new Error(
      'Method not implemented, this is only used by Thorchain, EVMs, and Solana.'
    );
  }

  async validateAddress(address: string): Promise<boolean> {
    const walletCore = await initWasm();
    const coinType = await CoinServiceFactory.createCoinService(
      this.chain
    ).getCoinType();
    return walletCore.AnyAddress.isValid(address, coinType);
  }

  async getPublicKey(
    publicKeyECDSA: string,
    publicKeyEdDSA: string
  ): Promise<any> {
    const walletCore = await initWasm();
    const coinType = await CoinServiceFactory.createCoinService(
      this.chain
    ).getCoinType();

    const childPublicKey = await this.getDerivedPubKey(
      publicKeyECDSA,
      publicKeyEdDSA,
      walletCore.CoinTypeExt.derivationPath(coinType)
    );

    return walletCore.PublicKey.createWithData(
      Buffer.from(childPublicKey, 'hex'),
      walletCore.PublicKeyType.secp256k1
    );
  }

  async getDerivedPubKey(
    hexPubKey: string,
    hexChainCode: string,
    derivePath: string
  ): Promise<string> {
    return GetDerivedPubKey(hexPubKey, hexChainCode, derivePath, false);
  }

  async deriveAddressFromPublicKey(
    publicKeyECDSA: string,
    publicKeyEdDSA: string
  ): Promise<string> {
    const publicKey = await this.getPublicKey(publicKeyECDSA, publicKeyEdDSA);

    const coinType = await CoinServiceFactory.createCoinService(
      this.chain
    ).getCoinType();
    return coinType.deriveAddressFromPublicKey(publicKey);
  }
}
