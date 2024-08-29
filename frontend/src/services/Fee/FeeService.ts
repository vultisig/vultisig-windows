/* eslint-disable */

import { WalletCore } from '@trustwallet/wallet-core';
import { Chain } from '../../model/chain';
import { FeeGasInfo } from '../../model/gas-info';
import { IFeeService } from './IFeeService';

export class FeeService implements IFeeService {
  chain: Chain;
  walletCore: WalletCore;
  constructor(chain: Chain, walletCore: WalletCore) {
    this.chain = chain;
    this.walletCore = walletCore;
  }

  getFee(): Promise<FeeGasInfo> {
    throw new Error('Method not implemented.');
  }
}
