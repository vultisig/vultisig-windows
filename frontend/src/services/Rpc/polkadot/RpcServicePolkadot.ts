/* eslint-disable */
import { Post } from '../../../../wailsjs/go/utils/GoHttp';
import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { SpecificPolkadot } from '../../../model/specific-transaction-info';
import { Endpoint } from '../../Endpoint';
import { IRpcService } from '../IRpcService';

export class RpcServicePolkadot implements IRpcService {
  async calculateFee(coin: Coin): Promise<number> {
    return 10_000_000_000;
  }

  async sendTransaction(encodedTransaction: string): Promise<string> {
    return await this.broadcastTransaction(encodedTransaction);
  }

  async getBalance(coin: Coin): Promise<string> {
    const balance = await this.fetchBalance(coin.address);
    return balance.toString();
  }

  async broadcastTransaction(hex: string): Promise<string> {
    let hexWithPrefix = hex.startsWith('0x') ? hex : '0x(hex)';
    const result: string = await this.callRPC('author_submitExtrinsic', [
      hexWithPrefix,
    ]);
    return result;
  }

  async getSpecificTransactionInfo(coin: Coin): Promise<SpecificPolkadot> {
    try {
      let recentBlockHash = await this.fetchBlockHash();
      let nonce = Number(await this.fetchNonce(coin.address));
      let currentBlockNumber = Number(await this.fetchBlockHeader());
      let runtime = await this.fetchRuntimeVersion();
      let genesisHash = await this.fetchGenesisBlockHash();

      return {
        fee: await this.calculateFee(coin),
        gasPrice: await this.calculateFee(coin),
        recentBlockHash: recentBlockHash,
        nonce: nonce,
        currentBlockNumber: currentBlockNumber,
        specVersion: runtime.specVersion,
        transactionVersion: runtime.transactionVersion,
        genesisHash: genesisHash,
      } as SpecificPolkadot;
    } catch (error) {
      console.error('getSpecificTransactionInfo::', error);
      return {
        recentBlockHash: '',
        nonce: 0,
        currentBlockNumber: 0,
        specVersion: 0,
        transactionVersion: 0,
        genesisHash: '',
      } as SpecificPolkadot;
    }
  }

  private async fetchBalance(address: string): Promise<BigInt> {
    const body = { key: address };
    const maxRetries = 3;
    const retryDelay = 1000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const requestBody = JSON.stringify(body);

        const response = await fetch(Endpoint.polkadotServiceBalance, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: requestBody,
        });

        const data = await response.json();

        if (data.data?.account?.balance) {
          const balance = BigInt(data.data.account.balance) * BigInt(10 ** 10);
          return balance;
        }
      } catch (error) {
        console.log(
          `PolkadotService > fetchBalance > ${error}, Attempt: ${attempt} of ${maxRetries}`
        );
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        } else {
          return BigInt(0);
        }
      }
    }

    return BigInt(0);
  }

  private async callRPC(method: string, params: any[]): Promise<any> {
    try {
      const payload = {
        jsonrpc: '2.0',
        method: method,
        params: params,
        id: 1,
      };

      const response = await Post(Endpoint.polkadotServiceRpc, payload);
      if (response && response.result) {
        return response.result;
      } else {
        return response.error || 'Unknown error occurred';
      }
    } catch (error: any) {
      return error.message || 'Unknown error occurred';
    }
  }

  private async fetchNonce(address: string): Promise<BigInt> {
    const result: string = await this.callRPC('system_accountNextIndex', [
      address,
    ]);
    return BigInt(result);
  }

  private async fetchBlockHash(): Promise<string> {
    const result: string = await this.callRPC('chain_getBlockHash', []);
    return result;
  }

  private async fetchGenesisBlockHash(): Promise<string> {
    const result: string = await this.callRPC('chain_getBlockHash', [0]);
    return result;
  }

  private async fetchRuntimeVersion(): Promise<any> {
    const result: any = await this.callRPC('state_getRuntimeVersion', []);

    console.log(result);

    return {
      specVersion: result.specVersion,
      transactionVersion: result.transactionVersion,
    };
  }

  private async fetchBlockHeader(): Promise<bigint> {
    const result: any = await this.callRPC('chain_getHeader', []);

    console.log(result);

    return BigInt(`0x${result.number}`);
  }
}
