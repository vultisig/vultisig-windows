/* eslint-disable */
import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { CoinMeta } from '../../../model/coin-meta';
import { SpecificTransactionInfo } from '../../../model/specific-transaction-info';
import { Endpoint } from '../../Endpoint';
import { IRpcService } from '../IRpcService';

export class RpcServicePolkadot implements IRpcService {
  calculateFee(coin: Coin): Promise<number> {
    throw new Error('Method not implemented.');
  }
  sendTransaction(encodedTransaction: string): Promise<string> {
    throw new Error('Method not implemented.');
  }
  getBalance(coin: Coin): Promise<string> {
    throw new Error('Method not implemented.');
  }
  broadcastTransaction(hex: string): Promise<string> {
    throw new Error('Method not implemented.');
  }
  resolveENS?(ensName: string): Promise<string> {
    throw new Error('Method not implemented.');
  }
  getSpecificTransactionInfo(coin: Coin): Promise<SpecificTransactionInfo> {
    throw new Error('Method not implemented.');
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
}
