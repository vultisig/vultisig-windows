/* eslint-disable */

import { ISendService } from '../ISendService';
import { ISendTransaction } from '../../../model/send-transaction';
import { Chain } from '../../../model/chain';
import { IRpcService } from '../../Rpc/IRpcService';
import { SendService } from '../SendService';
import { GasInfo, getDefaultGasInfo } from '../../../model/gas-info';
import { IService } from '../../IService';
import { ServiceFactory } from '../../ServiceFactory';
import { WalletCore } from '@trustwallet/wallet-core';
import { Balance } from '../../../model/balance';

export class SendServiceEvm extends SendService implements ISendService {
  constructor(chain: Chain, walletCore: WalletCore) {
    super(chain, walletCore);
    this.chain = chain;
    this.walletCore = walletCore;
  }

  async getMaxValues(
    tx: ISendTransaction,
    percentage: number
  ): Promise<number> {
    const service: IService = ServiceFactory.getService(
      this.chain,
      this.walletCore
    );
    const rpcService: IRpcService = service.rpcService;
    const balanceService = service.balanceService;
    const balance: Balance = await balanceService.getBalance(tx.coin);

    try {
      let gasInfo: GasInfo = getDefaultGasInfo();
      if (rpcService && rpcService.getGasInfo) {
        gasInfo = await rpcService.getGasInfo(tx.coin);
      }

      if (tx.coin.isNativeToken) {
        const max = this.calculateMaxValue(gasInfo.fee, balance, tx.coin);
        const amount = this.setPercentageAmount(max, percentage);
        return amount;
      } else {
        const max = this.calculateMaxValue(0, balance, tx.coin);
        const amount = this.setPercentageAmount(max, percentage);
        return amount;
      }
    } catch (ex) {
      console.error('Failed to get EVM balance, error: ', ex);

      const max = this.calculateMaxValue(0, balance, tx.coin);
      const amount = this.setPercentageAmount(max, percentage);
      return amount;
    }
  }

  loadGasInfoForSending(tx: ISendTransaction): Promise<void> {
    throw new Error('Method not implemented.');
  }

  getPriceRate(tx: ISendTransaction): Promise<number> {
    throw new Error('Method not implemented.');
  }

  validateForm(tx: ISendTransaction): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}
