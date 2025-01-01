import { KeysignChainSpecific } from '../../../chain/keysign/KeysignChainSpecific';
import { mayaConfig } from '../../../chain/maya/config';
import { THORChainSpecific } from '../../../gen/vultisig/keysign/v1/blockchain_specific_pb';
import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { Chain } from '../../../model/chain';
import { Endpoint } from '../../Endpoint';
import { IRpcService } from '../IRpcService';

export class RpcServiceMaya implements IRpcService {
  async calculateFee(_coin?: Coin): Promise<number> {
    return mayaConfig.fee;
  }

  async sendTransaction(encodedTransaction: string): Promise<string> {
    return await this.broadcastTransaction(encodedTransaction);
  }

  async getBalance(coin: Coin): Promise<string> {
    const url = Endpoint.fetchAccountBalanceMayachain(coin.address);

    const response = await fetch(url);

    const data = await response.json();

    return (
      data?.balances?.find(
        (b: any) => b.denom.toLowerCase() === coin.ticker.toLowerCase()
      )?.amount ?? 0
    );
  }

  async broadcastTransaction(hex: string): Promise<string> {
    const url = Endpoint.broadcastTransactionMayachain;

    // fetch to post the transaction
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: hex,
    });

    const data = await response.json();
    return data.tx_response?.txhash;
  }

  async resolveENS?(ensName: string): Promise<string> {
    const url = Endpoint.resolveTNS(ensName);
    const response = await fetch(url);
    const data = await response.json();
    const entry = data.entries.find(
      (e: any) =>
        e.chain.toLowerCase() === Chain.MayaChain.toString().toLowerCase()
    );

    if (!entry) {
      throw new Error('TNS entry not found');
    }
    return entry.address;
  }

  async getSpecificTransactionInfo(coin: Coin) {
    const account = await this.fetchAccountNumber(coin.address);

    const fee = await this.calculateFee(coin);

    const result: KeysignChainSpecific = {
      case: 'thorchainSpecific',
      value: new THORChainSpecific({
        accountNumber: BigInt(account?.account_number),
        sequence: BigInt(account?.sequence ?? 0),
        fee: BigInt(fee),
      }),
    };

    return result;
  }

  async fetchAccountNumber(address: string) {
    const url = Endpoint.fetchAccountNumberMayachain(address);
    const response = await fetch(url);

    const data = await response.json();
    return data.result.value;
  }
}
