import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { Balance } from '../../../model/balance';
import { ISendTransaction } from '../../../model/transaction';
import { ISendService } from '../ISendService';
import { SendService } from '../SendService';

export class SendServiceEvm extends SendService implements ISendService {
  calculateMaxValue(
    tx: ISendTransaction,
    percentage: number,
    balances: Map<Coin, Balance>,
    fee: number
  ): number {
    const amountInDecimal = super.calculateMaxValue(
      tx,
      percentage,
      balances,
      fee
    );

    let finalAmount = 0;
    if (tx.coin.isNativeToken) {
      finalAmount = amountInDecimal - fee;
    } else {
      finalAmount = amountInDecimal;
    }

    return finalAmount;
  }
}
