import { callRpc } from '../../../chain/rpc/callRpc';
import { Coin } from '@core/communication/vultisig/keysign/v1/coin_pb';
import { Endpoint } from '../../Endpoint';
import { IRpcService } from '../IRpcService';

export class RpcServicePolkadot implements IRpcService {
  async getBalance(coin: Coin): Promise<string> {
    const balance = await this.fetchBalance(coin.address);
    return balance.toString();
  }

  private async fetchBalance(address: string): Promise<bigint> {
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
          const balance = BigInt(
            Number(result.data.account.balance) * 10 ** 10
          );
          return balance;
        }
      } catch (error) {
        console.error(
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

  async callRPC(method: string, params: any[]): Promise<any> {
    return await callRpc({
      url: Endpoint.polkadotServiceRpc,
      method,
      params,
    });
  }

  async fetchNonce(address: string): Promise<number> {
    const result = await this.callRPC('system_accountNextIndex', [address]);
    return Number(result);
  }

  async fetchBlockHash(): Promise<string> {
    const result: string = await this.callRPC('chain_getBlockHash', []);
    return result;
  }

  async fetchGenesisBlockHash(): Promise<string> {
    const result = await this.callRPC('chain_getBlockHash', [0]);
    return result;
  }

  async fetchRuntimeVersion(): Promise<any> {
    const result: any = await this.callRPC('state_getRuntimeVersion', []);
    return {
      specVersion: result.specVersion,
      transactionVersion: result.transactionVersion,
    };
  }

  async fetchBlockHeader(): Promise<number> {
    const result: any = await this.callRPC('chain_getHeader', []);
    return Number(result.number);
  }
}
