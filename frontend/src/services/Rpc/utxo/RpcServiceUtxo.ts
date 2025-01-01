import { KeysignChainSpecific } from '../../../chain/keysign/KeysignChainSpecific';
import { adjustByteFee } from '../../../chain/utxo/fee/adjustByteFee';
import { UtxoFeeSettings } from '../../../chain/utxo/fee/UtxoFeeSettings';
import { UTXOSpecific } from '../../../gen/vultisig/keysign/v1/blockchain_specific_pb';
import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { UtxoInfo } from '../../../gen/vultisig/keysign/v1/utxo_info_pb';
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

  async getUtxos(coin: Coin): Promise<UtxoInfo[]> {
    const coinName = coin.chain.toLowerCase();
    const url = Endpoint.blockchairDashboard(coin.address, coinName);
    const request = await fetch(url);
    const response = await request.json();
    return response.data[coin.address].utxo.map(
      (utxo: any) =>
        new UtxoInfo({
          hash: utxo.transaction_hash,
          amount: BigInt(utxo.value),
          index: Number(utxo.index),
        })
    );
  }

  async getSpecificTransactionInfo(
    coin: Coin,
    _receiver: string,
    feeSettings?: UtxoFeeSettings
  ) {
    let byteFee = await this.calculateFee(coin);
    if (feeSettings) {
      byteFee = adjustByteFee(byteFee, feeSettings);
    }

    const result: KeysignChainSpecific = {
      case: 'utxoSpecific',
      value: new UTXOSpecific({
        byteFee: byteFee.toString(),
        sendMaxAmount: false,
      }),
    };

    return result;
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
