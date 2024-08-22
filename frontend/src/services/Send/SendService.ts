/* eslint-disable */

import { ISendService } from './ISendService';
import { ISendTransaction } from '../../model/send-transaction';
import { Chain } from '../../model/chain';
import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { Balance } from '../../model/balance';
import { WalletCore } from '@trustwallet/wallet-core';

export class SendService implements ISendService {
  chain: Chain;
  walletCore: WalletCore;
  constructor(chain: Chain, walletCore: WalletCore) {
    this.chain = chain;
    this.walletCore = walletCore;
  }

  getMaxValues(tx: ISendTransaction, percentage: number): Promise<number> {
    throw new Error('Method not implemented.');
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

  setPercentageAmount(amount: number, percentage: number): number {
    let max = amount;
    let multiplier = percentage / 100;
    let amountDecimal = max * multiplier;
    return amountDecimal;
  }

  convertFiatToCoin(newValue: string, coin: Coin, priceRate: number): number {
    const newValueDecimal = parseFloat(newValue);
    if (!isNaN(newValueDecimal)) {
      const newValueCoin = newValueDecimal / priceRate;
      const truncatedValueCoin = this.truncateToPlaces(
        newValueCoin,
        coin.decimals
      );
      return truncatedValueCoin;
    } else {
      return 0;
    }
  }

  convertToFiat(newValue: string, priceRate: number): number {
    const newValueDecimal = parseFloat(newValue);
    if (!isNaN(newValueDecimal)) {
      const newValueFiat = newValueDecimal * priceRate;
      const truncatedValueFiat = this.truncateToPlaces(newValueFiat, 2); // Assuming 2 decimal places for fiat
      return truncatedValueFiat;
    } else {
      return 0;
    }
  }

  calculateMaxValue(fee: number, balance: Balance, coin: Coin): number {
    let totalFeeAdjusted = fee;
    let maxValue = balance.rawAmount - totalFeeAdjusted;
    let maxValueCalculated = maxValue / Math.pow(10, coin.decimals);
    let truncated = this.truncateToPlaces(maxValueCalculated, coin.decimals);

    if (truncated < 0) {
      return 0;
    }

    return truncated;
  }

  private truncateToPlaces(value: number, places: number): number {
    const factor = Math.pow(10, places);
    return Math.floor(value * factor) / factor;
  }
}
