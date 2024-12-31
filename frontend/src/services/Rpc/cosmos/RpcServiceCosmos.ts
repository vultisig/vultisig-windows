import { Fetch, Post } from '../../../../wailsjs/go/utils/GoHttp';
import { KeysignChainSpecific } from '../../../chain/keysign/KeysignChainSpecific';
import {
  CosmosSpecific,
  TransactionType,
} from '../../../gen/vultisig/keysign/v1/blockchain_specific_pb';
import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { Chain } from '../../../model/chain';
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

  async getSpecificTransactionInfo(coin: Coin) {
    let defaultGas = 7500;

    switch (coin.chain) {
      case Chain.Dydx:
        defaultGas = 2500000000000000;
        break;
      case Chain.TerraClassic:
        defaultGas = 100000000;
        break;
      case Chain.Noble:
        defaultGas = 30000;
        break;
    }

    const account = await this.fetchAccountNumber(coin.address);

    const result: KeysignChainSpecific = {
      case: 'cosmosSpecific',
      value: new CosmosSpecific({
        accountNumber: BigInt(account.account_number),
        sequence: BigInt(account.sequence),
        gas: BigInt(defaultGas),
        transactionType: TransactionType.UNSPECIFIED,
      }),
    };

    return result;
  }

  async fetchBalances(address: string): Promise<CosmosBalance[]> {
    const url = this.balanceURL(address);
    if (!url) {
      return [];
    }

    const response: CosmosBalanceResponse = await Fetch(url);
    return response.balances;
  }

  async fetchAccountNumber(address: string): Promise<CosmosAccountValue> {
    const url = this.accountNumberURL(address);

    const response = await Fetch(url);

    return response.account as CosmosAccountValue;
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

  protected accountNumberURL(address: string): string {
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

interface CosmosAccountValue {
  account_number: string;
  sequence: string;
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
