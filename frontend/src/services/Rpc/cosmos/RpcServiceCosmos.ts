import { Fetch, Post } from '../../../../wailsjs/go/utils/GoHttp';
import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { IRpcService } from '../IRpcService';

export class RpcServiceCosmos implements IRpcService {
  sendTransaction(encodedTransaction: string): Promise<string> {
    return this.broadcastTransaction(encodedTransaction);
  }

  async getBalance(coin: Coin): Promise<string> {
    const balances = await this.fetchBalances(coin.address);
    const balance = balances.find(balance => {
      if (coin.isNativeToken) {
        if (balance.denom.toLowerCase() === this.denom()) {
          return balance.amount;
        }
      } else {
        if (
          balance.denom.toLowerCase() === coin.contractAddress.toLowerCase()
        ) {
          return balance.amount;
        }
      }
    });

    if (balance) {
      return balance.amount;
    } else {
      return '0';
    }
  }

  async fetchBalances(address: string): Promise<CosmosBalance[]> {
    const url = this.balanceURL(address);
    if (!url) {
      return [];
    }

    const response: CosmosBalanceResponse = await Fetch(url);
    return response.balances;
  }

  async broadcastTransaction(jsonString: string): Promise<string> {
    const url = this.transactionURL();
    if (!url) {
      throw new HelperError(
        'broadcastTransaction: Failed to get transaction URL'
      );
    }

    try {
      const response = await Post(url, JSON.parse(jsonString));

      const data: CosmosTransactionBroadcastResponse = response;

      if (
        data.tx_response?.raw_log &&
        data.tx_response?.raw_log !== '' &&
        data.tx_response?.raw_log !== '[]'
      ) {
        return data.tx_response.raw_log;
      }

      if (data.tx_response?.txhash) {
        return data.tx_response.txhash;
      }

      return '';
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      } else {
        throw new HelperError('Unknown error occurred');
      }
    }
  }

  protected denom(): string {
    throw new Error('Must override in subclass');
  }

  protected balanceURL(address: string): string | null {
    throw new Error(`Must override in subclass, address: ${address}`);
  }

  protected transactionURL(): string | null {
    throw new Error('Must override in subclass');
  }
}

interface CosmosBalance {
  amount: string;
  denom: string;
}

interface CosmosBalanceResponse {
  balances: CosmosBalance[];
}

interface CosmosTransactionBroadcastResponse {
  tx_response?: {
    code?: number;
    txhash?: string;
    raw_log?: string;
  };
}

class HelperError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HelperError';
  }
}
