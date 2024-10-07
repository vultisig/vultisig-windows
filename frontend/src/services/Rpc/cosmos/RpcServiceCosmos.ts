/* eslint-disable */
import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { Chain } from '../../../model/chain';
import { SpecificCosmos } from '../../../model/specific-transaction-info';
import { IRpcService } from '../IRpcService';

export class RpcServiceCosmos implements IRpcService {
  calculateFee(coin: Coin): Promise<number> {
    throw new Error('Method not implemented.');
  }

  sendTransaction(encodedTransaction: string): Promise<string> {
    return this.broadcastTransaction(encodedTransaction);
  }

  async getBalance(coin: Coin): Promise<string> {
    const balances = await this.fetchBalances(coin.address);
    const balance = balances.find(balance => {
      if (balance.denom.toLowerCase() === this.denom()) {
        return balance.amount;
      }
    });

    if (balance) {
      return balance.amount;
    } else {
      return '0';
    }
  }

  async getSpecificTransactionInfo(coin: Coin): Promise<SpecificCosmos> {
    try {
      const account = await this.fetchAccountNumber(coin.address);

      let defaultGas = 7500;
      if (coin.chain == Chain.Dydx) defaultGas = 2500000000000000;

      return {
        accountNumber: Number(account?.accountNumber),
        sequence: Number(account?.sequence),
        gas: 0,
        transactionType: 0,
        gasPrice: defaultGas,
        fee: defaultGas,
      } as SpecificCosmos;
    } catch (error) {
      console.error('getSpecificTransactionInfo::', error);
      return {
        accountNumber: 0,
        sequence: 0,
        gas: 0,
        transactionType: 0,
        gasPrice: 0,
        fee: 0,
      } as SpecificCosmos;
    }
  }

  async fetchBalances(address: string): Promise<CosmosBalance[]> {
    const url = this.balanceURL(address);
    if (!url) {
      return [];
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new HelperError(`HTTP error! status: ${response.status}`);
    }
    const data: CosmosBalanceResponse = await response.json();

    return data.balances;
  }

  async fetchAccountNumber(
    address: string
  ): Promise<CosmosAccountValue | null> {
    const url = this.accountNumberURL(address);
    if (!url) {
      return null;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new HelperError(`HTTP error! status: ${response.status}`);
    }
    const data: CosmosAccountsResponse = await response.json();
    return data.account;
  }

  async broadcastTransaction(jsonString: string): Promise<string> {
    const url = this.transactionURL();
    if (!url) {
      throw new HelperError('Failed to get transaction URL');
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonString,
      });

      if (!response.ok) {
        throw new HelperError(`HTTP error! status: ${response.status}`);
      }

      const data: CosmosTransactionBroadcastResponse = await response.json();

      if (data.txResponse?.code === 0 || data.txResponse?.code === 19) {
        if (data.txResponse?.txhash) {
          return data.txResponse.txhash;
        }
      }
      throw new HelperError(JSON.stringify(data));
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
  accountNumber: string;
  sequence: string;
}

interface CosmosBalanceResponse {
  balances: CosmosBalance[];
}

interface CosmosAccountsResponse {
  account: CosmosAccountValue;
}

interface CosmosTransactionBroadcastResponse {
  txResponse?: {
    code?: number;
    txhash?: string;
  };
}

class HelperError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HelperError';
  }
}
