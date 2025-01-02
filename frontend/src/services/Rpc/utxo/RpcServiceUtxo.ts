import { KeysignChainSpecific } from '../../../chain/keysign/KeysignChainSpecific';
import { assertChainField } from '../../../chain/utils/assertChainField';
import { getUtxoAddressInfo } from '../../../chain/utxo/blockchair/getUtxoAddressInfo';
import { adjustByteFee } from '../../../chain/utxo/fee/adjustByteFee';
import { UtxoFeeSettings } from '../../../chain/utxo/fee/UtxoFeeSettings';
import { UTXOSpecific } from '../../../gen/vultisig/keysign/v1/blockchain_specific_pb';
import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { Endpoint } from '../../Endpoint';
import { GetChainSpecificInput, IRpcService } from '../IRpcService';
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
    const { data } = await getUtxoAddressInfo(assertChainField(coin));
    return data[coin.address].address.balance.toString();
  }

  async getChainSpecific({
    coin,
    feeSettings,
    sendMaxAmount = false,
  }: GetChainSpecificInput<UtxoFeeSettings>) {
    let byteFee = await this.calculateFee(coin);
    if (feeSettings) {
      byteFee = adjustByteFee(byteFee, feeSettings);
    }

    const result: KeysignChainSpecific = {
      case: 'utxoSpecific',
      value: new UTXOSpecific({
        byteFee: byteFee.toString(),
        sendMaxAmount,
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
