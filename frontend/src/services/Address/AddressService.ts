import { WalletCore } from '@trustwallet/wallet-core';

import { GetDerivedPubKey } from '../../../wailsjs/go/tss/TssService';
import { Chain } from '../../model/chain';
import { CoinServiceFactory } from '../Coin/CoinServiceFactory';
import { ICoinService } from '../Coin/ICoinService';
import { IAddressService } from './IAddressService';

export class AddressService implements IAddressService {
  protected coinService: ICoinService;
  protected coinType: any;
  protected walletCore: WalletCore;

  constructor(chain: Chain, walletCore: WalletCore) {
    this.walletCore = walletCore;
    this.coinService = CoinServiceFactory.createCoinService(chain, walletCore);
    this.coinType = this.coinService.getCoinType();
  }

  resolveDomainAddress(address: string): Promise<string> {
    console.log('resolve domain address', address);
    throw new Error(
      'Method not implemented, this is only used by Thorchain, EVMs, and Solana.'
    );
  }

  // this should work for all chains
  async validateAddress(address: string): Promise<boolean> {
    const coinType = await this.coinType;
    return this.walletCore.AnyAddress.isValid(address, coinType);
  }

  async getPublicKey(
    publicKeyECDSA: string,
    publicKeyEdDSA: string,
    hexChainCode: string
  ): Promise<any> {
    const walletCore = this.walletCore;
    const coinType = await this.coinType;

    const childPublicKey = await this.getDerivedPubKey(
      publicKeyECDSA,
      hexChainCode,
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
    publicKeyEdDSA: string,
    hexChainCode: string
  ): Promise<string> {
    const publicKey = await this.getPublicKey(
      publicKeyECDSA,
      publicKeyEdDSA,
      hexChainCode
    );
    return this.walletCore.CoinTypeExt.deriveAddressFromPublicKey(
      this.coinType,
      publicKey
    );
  }
}
