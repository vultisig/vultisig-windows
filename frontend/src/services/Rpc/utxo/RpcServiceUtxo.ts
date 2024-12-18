import { adjustByteFee } from '../../../chain/utxo/fee/adjustByteFee';
import { UtxoFeeSettings } from '../../../chain/utxo/fee/UtxoFeeSettings';
import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import {
  SpecificUtxo,
  SpecificUtxoInfo,
} from '../../../model/specific-transaction-info';
import { Endpoint } from '../../Endpoint';
import { IRpcService } from '../IRpcService';
import { RpcService } from '../RpcService';

export class RpcServiceUtxo extends RpcService implements IRpcService {
  async calculateFee(coin: Coin): Promise<number> {
    const url = Endpoint.blockchairStats(coin.chain.toLowerCase());
    const request = await fetch(url);
    const response = await request.json();
    const fee = response.data.suggested_transaction_fee_per_byte_sat;
    return fee;
  }

  async getBalance(coin: Coin): Promise<string> {
    const coinName = coin.chain.toLowerCase();
    const url = Endpoint.blockchairDashboard(coin.address, coinName);
    const request = await fetch(url);
    const response = await request.json();
    const balance = response.data[coin.address].address.balance;
    return balance;
  }

  private async getUtxos(coin: Coin): Promise<SpecificUtxoInfo[]> {
    const coinName = coin.chain.toLowerCase();
    const url = Endpoint.blockchairDashboard(coin.address, coinName);
    const request = await fetch(url);
    const response = await request.json();
    return response.data[coin.address].utxo.map((utxo: any) => {
      return {
        hash: utxo.transaction_hash,
        amount: BigInt(utxo.value),
        index: Number(utxo.index),
      } as SpecificUtxoInfo;
    });
  }

  async getSpecificTransactionInfo(
    coin: Coin,
    _receiver: string,
    feeSettings?: UtxoFeeSettings
  ): Promise<SpecificUtxo> {
    let byteFee = await this.calculateFee(coin);
    if (feeSettings) {
      byteFee = adjustByteFee(byteFee, feeSettings);
    }

    const specificTransactionInfo: SpecificUtxo = {
      gasPrice: byteFee / 10 ** coin.decimals, // To display in the UI
      fee: byteFee,
      byteFee,
      sendMaxAmount: false, // By default, we don't send as the max amount
      utxos: await this.getUtxos(coin),
    };

    return specificTransactionInfo;
  }

  async sendTransaction(encodedTransaction: string): Promise<string> {
    return await this.broadcastTransaction(encodedTransaction);
  }

  async broadcastTransaction(hex: string): Promise<string> {
    const url = Endpoint.blockchairBroadcast(this.chain.toLowerCase());

    const request = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: hex }),
    });

    const response = await request.json();

    return response.data.transaction_hash;
  }
}
