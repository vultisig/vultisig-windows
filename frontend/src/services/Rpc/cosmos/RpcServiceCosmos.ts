/* eslint-disable */
import { Fetch, Post } from '../../../../wailsjs/go/utils/GoHttp';
import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { Chain } from '../../../model/chain';
import { SpecificCosmos } from '../../../model/specific-transaction-info';
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

  async getSpecificTransactionInfo(coin: Coin): Promise<SpecificCosmos> {
    let defaultGas = 7500;

    switch (coin.chain) {
      case Chain.Dydx:
        defaultGas = 2500000000000000;
        break;
      case Chain.TerraClassic:
        defaultGas = 100000000;
        break;
      case Chain.Noble:
        defaultGas = 20000;
        break;
    }

    let result: SpecificCosmos = {
      gas: defaultGas,
      transactionType: 0,
      gasPrice: defaultGas,
      fee: defaultGas,
      accountNumber: 0,
      sequence: 0,
    };

    try {
      const account = await this.fetchAccountNumber(coin.address);
      if (account) {
        result.accountNumber = Number(account.account_number);
        result.sequence = Number(account.sequence);
      } else {
        console.error('getSpecificTransactionInfo::No account data found');
      }
    } catch (error) {
      console.error('getSpecificTransactionInfo::', error);
    }

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

  async fetchAccountNumber(
    address: string
  ): Promise<CosmosAccountValue | null> {
    const url = this.accountNumberURL(address);
    if (!url) {
      return null;
    }

    const response = await Fetch(url);

    if (!response.account) {
      console.error('fetchAccountNumber:: No account data found');
      return null;
    }

    if (!response.account as unknown as CosmosAccountValue) {
      console.error('fetchAccountNumber:: No account data found');
      return null;
    }

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
      let response = await Post(url, JSON.parse(jsonString));

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
    throw new Error('Must override in subclass');
  }

  protected accountNumberURL(address: string): string | null {
    throw new Error('Must override in subclass');
  }

  protected transactionURL(): string | null {
    throw new Error('Must override in subclass');
  }

  resolveENS?(ensName: string): Promise<string> {
    throw new Error('Method not implemented.');
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

interface CosmosAccountsResponse {
  account: CosmosAccountValue;
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
