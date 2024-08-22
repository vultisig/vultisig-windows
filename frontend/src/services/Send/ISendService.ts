import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { ISendTransaction } from '../../model/send-transaction';

export interface ISendService {
  setMaxValues(tx: ISendTransaction, percentage: number): Promise<number>;
  loadGasInfoForSending(tx: ISendTransaction): Promise<void>;
  getPriceRate(tx: ISendTransaction): Promise<number>;
  convertFiatToCoin(newValue: string, coin: Coin, priceRate: number): number;
  convertToFiat(newValue: string, priceRate: number): number;
  validateForm(tx: ISendTransaction): Promise<boolean>;
  // Each chain validates different things, so this method should be implemented in each service
}
