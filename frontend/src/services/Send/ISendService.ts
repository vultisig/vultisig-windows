import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { Balance } from '../../model/balance';
import { Fiat } from '../../model/fiat';
import { Rate } from '../../model/price-rate';
import { SpecificTransactionInfo } from '../../model/specific-transaction-info';
import { ISendTransaction } from '../../model/transaction';
import { IService } from '../IService';

export interface ISendService {
  calculateMaxValue(
    tx: ISendTransaction,
    percentage: number,
    balances: Map<Coin, Balance>,
    fee: number
  ): number;
  convertToFiat(
    coin: Coin,
    priceRates: Map<string, Rate[]>,
    amount: number,
    globalCurrency: Fiat
  ): Promise<number>;
  convertFromFiat(
    coin: Coin,
    priceRates: Map<string, Rate[]>,
    amountInFiat: number,
    globalCurrency: Fiat
  ): Promise<number>;
  loadGasInfoForSending(coin: Coin): Promise<SpecificTransactionInfo>;
  validateForm(
    tx: ISendTransaction,
    toAddress: string,
    amount: string,
    service: IService | null
  ): Promise<boolean>;
}
