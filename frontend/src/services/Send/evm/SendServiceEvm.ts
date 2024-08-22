/* eslint-disable */

import { ISendService } from '../ISendService';
import { ISendTransaction } from '../../../model/send-transaction';
import { Chain } from '../../../model/chain';
import { RpcServiceFactory } from '../../Rpc/RpcServiceFactory';
import { IRpcService } from '../../Rpc/IRpcService';
import { SendService } from '../SendService';

export class SendServiceEvm extends SendService implements ISendService {
  constructor(chain: Chain) {
    super(chain);
    this.chain = chain;
  }

  async setMaxValues(
    tx: ISendTransaction,
    percentage: number
  ): Promise<number> {
    try {
      if (tx.coin.isNativeToken) {
        const rpcService: IRpcService = RpcServiceFactory.createRpcService(
          this.chain
        );
        let gasInfo = { gasPrice: BigInt(0), priorityFee: BigInt(0), nonce: 0 };
        if (rpcService && rpcService.getGasInfo) {
          gasInfo = await rpcService.getGasInfo(tx.fromAddress);
        }

        console.log('gasInfo', gasInfo);

        const amount = this.setPercentageAmount(tx.amount, percentage);

        // let evm = try await blockchainService.fetchSpecific(for: tx.coin, sendMaxAmount: tx.sendMaxAmount, isDeposit: tx.isDeposit, transactionType: tx.transactionType)
        // let totalFeeWei = evm.fee
        // tx.amount = "\(tx.coin.getMaxValue(totalFeeWei))" // the decimals must be truncaded otherwise the give us precisions errors
        // setPercentageAmount(tx: tx, for: percentage)
      } else {
        // tx.amount = "\(tx.coin.getMaxValue(0))"
        // setPercentageAmount(tx: tx, for: percentage)
      }
    } catch (ex) {
      // tx.amount = "\(tx.coin.getMaxValue(0))"
      // setPercentageAmount(tx: tx, for: percentage)
      console.error('Failed to get EVM balance, error: ', ex);
    }

    // await convertToFiat(newValue: tx.amount, tx: tx)

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
}
