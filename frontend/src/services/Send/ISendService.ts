import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { Balance } from '../../model/balance';
import { FeeGasInfo } from '../../model/gas-info';
import { ISendTransaction } from '../../model/send-transaction';

export interface ISendService {
  calculateMaxValue(fee: number, balance: Balance, coin: Coin): number;
  getMaxValues(tx: ISendTransaction, percentage: number): Promise<number>;
  loadGasInfoForSending(tx: ISendTransaction): Promise<FeeGasInfo>;
  getPriceRate(tx: ISendTransaction): Promise<number>;
  convertFiatToCoin(newValue: string, coin: Coin, priceRate: number): number;
  convertToFiat(newValue: string, priceRate: number): number;
  validateForm(tx: ISendTransaction): Promise<boolean>;
  // Each chain validates different things, so this method should be implemented in each service
}
