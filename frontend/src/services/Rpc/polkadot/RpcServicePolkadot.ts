/* eslint-disable */
import { Post } from '../../../../wailsjs/go/utils/GoHttp';
import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { SpecificPolkadot } from '../../../model/specific-transaction-info';
import { Endpoint } from '../../Endpoint';
import { IRpcService } from '../IRpcService';

export class RpcServicePolkadot implements IRpcService {
  async calculateFee(coin: Coin): Promise<number> {
    return 1e10;
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
      let fee = await this.calculateFee(coin);
      let recentBlockHash = await this.fetchBlockHash();
      let nonce = await this.fetchNonce(coin.address);
      let currentBlockNumber = Number(await this.fetchBlockHeader());
      let runtime = await this.fetchRuntimeVersion();
      let genesisHash = await this.fetchGenesisBlockHash();

      const specificTransactionInfo: SpecificPolkadot = {
        fee: fee,
        gasPrice: fee / 10 ** coin.decimals,
        recentBlockHash: recentBlockHash,
        nonce: nonce,
        currentBlockNumber: currentBlockNumber,
        specVersion: runtime.specVersion,
        transactionVersion: runtime.transactionVersion,
        genesisHash: genesisHash,
      } as SpecificPolkadot;

      console.log('specificTransactionInfo', specificTransactionInfo);

      return specificTransactionInfo;
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

        const result = await response.json();

        if (result.data?.account?.balance) {
          const balance = BigInt(Number(result.data.account.balance) * 10e10);
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
      if (response && response.result !== undefined) {
        return response.result;
      } else {
        return response.error || 'Unknown error occurred';
      }
    } catch (error: any) {
      return error.message || 'Unknown error occurred';
    }
  }

  private async fetchNonce(address: string): Promise<number> {
    const result = await this.callRPC('system_accountNextIndex', [address]);
    return Number(result);
  }

  private async fetchBlockHash(): Promise<string> {
    const result: string = await this.callRPC('chain_getBlockHash', []);
    return result;
  }

  private async fetchGenesisBlockHash(): Promise<string> {
    const result = await this.callRPC('chain_getBlockHash', [0]);
    return result;
  }

  private async fetchRuntimeVersion(): Promise<any> {
    const result: any = await this.callRPC('state_getRuntimeVersion', []);
    return {
      specVersion: result.specVersion,
      transactionVersion: result.transactionVersion,
    };
  }

  private async fetchBlockHeader(): Promise<number> {
    const result: any = await this.callRPC('chain_getHeader', []);
    return Number(result.number);
  }
}
