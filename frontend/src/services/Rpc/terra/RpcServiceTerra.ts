/* eslint-disable */
import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { Endpoint } from '../../Endpoint';
import { RpcServiceCosmos } from '../cosmos/RpcServiceCosmos';

export class RpcServiceTerraV2 extends RpcServiceCosmos {
  protected denom(): string {
    return 'uluna';
  }

  protected balanceURL(address: string): string {
    return Endpoint.fetchTerraV2AccountBalance(address);
  }

  protected accountNumberURL(address: string): string {
    return Endpoint.fetchTerraV2AccountNumber(address);
  }

  protected transactionURL(): string {
    return Endpoint.broadcastTerraV2Transaction;
  }

  async getBalance(coin: Coin): Promise<string> {
    if (coin.isNativeToken) {
      return await this.getTokenBalance(coin);
    } else {
      return await this.fetchWasmTokenBalances(coin);
    }
  }

  async getTokenBalance(coin: Coin): Promise<string> {
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

  async fetchWasmTokenBalances(coin: Coin): Promise<string> {
    const payload = JSON.stringify({ balance: { address: coin.address } });
    const base64Payload = Buffer.from(payload).toString('base64');

    if (!base64Payload) {
      return '0';
    }

    let url;
    try {
      url = Endpoint.fetchTerraV2WasmTokenBalance(
        coin.contractAddress,
        base64Payload
      );
    } catch (e) {
      return '0';
    }

    if (!url) {
      return '0';
    }

    let response;
    try {
      response = await fetch(url);
    } catch (e) {
      return '0';
    }

    if (!response.ok) {
      return '0';
    }

    const data = await response.json();

    const balance = data?.data?.balance || '0';

    return balance;
  }
}

export class RpcServiceTerraClassic extends RpcServiceCosmos {
  protected denom(): string {
    return 'uluna';
  }

  protected balanceURL(address: string): string {
    return Endpoint.fetchTerraClassicAccountBalance(address);
  }

  protected accountNumberURL(address: string): string {
    return Endpoint.fetchTerraClassicAccountNumber(address);
  }

  protected transactionURL(): string {
    return Endpoint.broadcastTerraClassicTransaction;
  }

  async getBalance(coin: Coin): Promise<string> {
    if (coin.isNativeToken) {
      return await this.getTokenBalance(coin);
    } else {
      return await this.fetchWasmTokenBalances(coin);
    }
  }

  async getTokenBalance(coin: Coin): Promise<string> {
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

  async fetchWasmTokenBalances(coin: Coin): Promise<string> {
    const payload = JSON.stringify({ balance: { address: coin.address } });
    const base64Payload = Buffer.from(payload).toString('base64');

    if (!base64Payload) {
      return '0';
    }

    let url;
    try {
      url = Endpoint.fetchTerraClassicWasmTokenBalance(
        coin.contractAddress,
        base64Payload
      );
    } catch (e) {
      return '0';
    }

    if (!url) {
      return '0';
    }

    let response;
    try {
      response = await fetch(url);
    } catch (e) {
      return '0';
    }

    if (!response.ok) {
      return '0';
    }

    const data = await response.json();

    const balance = data?.data?.balance || '0';

    return balance;
  }
}
