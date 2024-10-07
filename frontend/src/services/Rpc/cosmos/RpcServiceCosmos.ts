/* eslint-disable */
import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { SpecificCosmos } from '../../../model/specific-transaction-info';
import { Endpoint } from '../../Endpoint';
import { IRpcService } from '../IRpcService';

export class RpcServiceCosmos implements IRpcService {
  // Methods to be overridden
  protected balanceURL(address: string): string | null {
    throw new Error('Must override in subclass');
  }

  protected accountNumberURL(address: string): string | null {
    throw new Error('Must override in subclass');
  }

  protected transactionURL(): string | null {
    throw new Error('Must override in subclass');
  }

  calculateFee(coin: Coin): Promise<number> {
    throw new Error('Method not implemented.');
  }
  sendTransaction(encodedTransaction: string): Promise<string> {
    throw new Error('Method not implemented.');
  }
  getBalance(coin: Coin): Promise<string> {
    throw new Error('Method not implemented.');
  }

  resolveENS?(ensName: string): Promise<string> {
    throw new Error('Method not implemented.');
  }
  getSpecificTransactionInfo(coin: Coin): Promise<SpecificCosmos> {
    throw new Error('Method not implemented.');
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
}

export class RpcServiceCosmosGaia extends RpcServiceCosmos {
  protected balanceURL(address: string): string {
    return Endpoint.fetchCosmosAccountBalance(address);
  }

  protected accountNumberURL(address: string): string {
    return Endpoint.fetchCosmosAccountNumber(address);
  }

  protected transactionURL(): string {
    return Endpoint.broadcastCosmosTransaction;
  }
}

export class RpcServiceCosmosKurija extends RpcServiceCosmos {
  protected balanceURL(address: string): string {
    return Endpoint.fetchKujiraAccountBalance(address);
  }

  protected accountNumberURL(address: string): string {
    return Endpoint.fetchKujiraAccountNumber(address);
  }

  protected transactionURL(): string {
    return Endpoint.broadcastKujiraTransaction;
  }
}

export class RpcServiceCosmosDydx extends RpcServiceCosmos {
  protected balanceURL(address: string): string {
    return Endpoint.fetchDydxAccountBalance(address);
  }

  protected accountNumberURL(address: string): string {
    return Endpoint.fetchDydxAccountNumber(address);
  }

  protected transactionURL(): string {
    return Endpoint.broadcastDydxTransaction;
  }
}

interface CosmosBalance {
  // Define the structure of CosmosBalance
  // You may need to adjust this based on your actual data structure
  amount: string;
  denom: string;
}

interface CosmosAccountValue {
  // Define the structure of CosmosAccountValue
  // You may need to adjust this based on your actual data structure
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
