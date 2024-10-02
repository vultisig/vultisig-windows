import { WalletCore } from '@trustwallet/wallet-core';

import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { Balance } from '../../model/balance';
import { Chain } from '../../model/chain';
import { CoinMeta } from '../../model/coin-meta';
import { Fiat } from '../../model/fiat';
import { Rate } from '../../model/price-rate';
import { SpecificTransactionInfo } from '../../model/specific-transaction-info';
import { ISendTransaction } from '../../model/transaction';
import { IService } from '../../services/IService';
import { AddressServiceFactory } from '../Address/AddressServiceFactory';
import { IAddressService } from '../Address/IAddressService';
import { FeeServiceFactory } from '../Fee/FeeServiceFactory';
import { IFeeService } from '../Fee/IFeeService';
import { ISendService } from './ISendService';

export class SendService implements ISendService {
  chain: Chain;
  walletCore: WalletCore;
  addressService: IAddressService | null = null;
  feeService: IFeeService | null = null;

  constructor(chain: Chain, walletCore: WalletCore) {
    this.chain = chain;
    this.walletCore = walletCore;
    this.addressService = AddressServiceFactory.createAddressService(
      chain,
      walletCore
    );
    this.feeService = FeeServiceFactory.createFeeService(chain, walletCore);
  }

  calculateMaxValue(
    tx: ISendTransaction,
    percentage: number,
    balances: Map<Coin, Balance>,
    _fee: number
  ): number {
    const balance = balances.get(tx.coin)?.rawAmount ?? 0;
    const amount = balance * (percentage / 100);
    const amountInDecimal = amount / Math.pow(10, tx.coin.decimals);
    return amountInDecimal;
  }

  async convertToFiat(
    coin: Coin,
    priceRates: Map<string, Rate[]>,
    amount: number,
    globalCurrency: Fiat
  ): Promise<number> {
    const toCoinMeta = CoinMeta.fromCoin(coin);
    const toSortedCoin = CoinMeta.sortedStringify(toCoinMeta);
    const rates: Rate[] = priceRates.get(toSortedCoin) ?? [];

    // TODO: Get the rate for the selected fiat on settings
    const rate = rates.find(rate => {
      return rate.fiat === globalCurrency;
    });
    if (rate) {
      const fiatAmount = amount * rate.value;
      return fiatAmount;
    }
    return 0;
  }

  async convertFromFiat(
    coin: Coin,
    priceRates: Map<string, Rate[]>,
    amountInFiat: number,
    globalCurrency: Fiat
  ): Promise<number> {
    const toCoinMeta = CoinMeta.fromCoin(coin);
    const toSortedCoin = CoinMeta.sortedStringify(toCoinMeta);
    const rates: Rate[] = priceRates.get(toSortedCoin) ?? [];

    const rate = rates.find(rate => {
      return rate.fiat === globalCurrency;
    });
    if (rate) {
      const tokenAmount = amountInFiat / rate.value;
      return tokenAmount;
    }
    return 0;
  }

  async loadGasInfoForSending(coin: Coin): Promise<SpecificTransactionInfo> {
    if (!this.addressService) {
      throw new Error('Service is not initialized');
    }

    try {
      if (this.feeService) {
        return await this.feeService.getFee(coin);
      } else {
        throw new Error('Fee service is not initialized');
      }
    } catch (error) {
      console.error('Failed to load gas info', error);
      throw new Error('Failed to load gas info');
    }
  }

  // Maybe this will be different depending on the coin
  async validateForm(
    tx: ISendTransaction,
    toAddress: string,
    amount: string,
    service: IService | null
  ): Promise<boolean> {
    if (!toAddress) {
      throw new Error('To address is not provided');
    }

    if (!tx.coin) {
      throw new Error('Coin is not selected');
    }

    if (!service) {
      throw new Error('Service is not initialized');
    }

    if (amount === '') {
      throw new Error('Amount is not provided');
    }

    if (isNaN(Number(amount))) {
      throw new Error('Invalid amount');
    }

    if (Number(amount) <= 0) {
      throw new Error('Amount should be greater than 0');
    }

    const isAddressValid =
      await service.addressService.validateAddress(toAddress);
    if (!isAddressValid) {
      throw new Error('Invalid address');
    }

    return true;
  }

  setPercentageAmount(amount: number, percentage: number): number {
    const max = amount;
    const multiplier = percentage / 100;
    const amountDecimal = max * multiplier;
    return amountDecimal;
  }
}
