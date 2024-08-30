import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { Balance } from '../../model/balance';
import { FeeGasInfo } from '../../model/gas-info';
import { Rate } from '../../model/price-rate';
import { ISendTransaction } from '../../model/send-transaction';
import { IService } from '../IService';

export interface ISendService {
  calculateMaxValue(
    tx: ISendTransaction,
    percentage: number,
    balances: Map<Coin, Balance>
  ): number;
  convertToFiat(
    coin: Coin,
    priceRates: Map<string, Rate[]>,
    amount: number
  ): Promise<number>;
  convertFromFiat(
    coin: Coin,
    priceRates: Map<string, Rate[]>,
    amountInFiat: number
  ): Promise<number>;
  loadGasInfoForSending(coin: Coin): Promise<FeeGasInfo>;
  validateForm(
    tx: ISendTransaction,
    toAddress: string,
    amount: string,
    service: IService | null
  ): Promise<boolean>;
}
