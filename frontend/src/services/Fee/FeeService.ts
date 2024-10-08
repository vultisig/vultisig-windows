/* eslint-disable */
import { WalletCore } from '@trustwallet/wallet-core';
import { Chain } from '../../model/chain';
import {
  BasicSpecificTransactionInfo,
  SpecificTransactionInfo,
} from '../../model/specific-transaction-info';
import { IFeeService } from './IFeeService';
import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';

export class FeeService implements IFeeService {
  chain: Chain;
  walletCore: WalletCore;
  constructor(chain: Chain, walletCore: WalletCore) {
    this.chain = chain;
    this.walletCore = walletCore;
  }

  async getFee(coin: Coin): Promise<SpecificTransactionInfo> {
    return {} as BasicSpecificTransactionInfo;
  }
}
