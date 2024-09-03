/* eslint-disable */
import { WalletCore } from '@trustwallet/wallet-core';
import { Chain } from '../../model/chain';
import { BasicGasInfo, SpecificGasInfo } from '../../model/gas-info';
import { IFeeService } from './IFeeService';
import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';

export class FeeService implements IFeeService {
  chain: Chain;
  walletCore: WalletCore;
  constructor(chain: Chain, walletCore: WalletCore) {
    this.chain = chain;
    this.walletCore = walletCore;
  }

  async getFee(coin: Coin): Promise<SpecificGasInfo> {
    return {} as BasicGasInfo;
  }
}
