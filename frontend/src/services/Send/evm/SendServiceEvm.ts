/* eslint-disable */
import { ISendService } from '../ISendService';
import { ISendTransaction } from '../../../model/send-transaction';
import { SendService } from '../SendService';
import { Balance } from '../../../model/balance';
import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';

export class SendServiceEvm extends SendService implements ISendService {
  calculateMaxValue(
    tx: ISendTransaction,
    percentage: number,
    balances: Map<Coin, Balance>,
    fee: number
  ): number {
    let amountInDecimal = super.calculateMaxValue(
      tx,
      percentage,
      balances,
      fee
    );

    let finalAmount = 0;
    if (tx.coin.isNativeToken) {
      finalAmount = amountInDecimal - fee;
    }

    return finalAmount;
  }
}
