import { cosmosFeeCoinDenom } from '../../../chain/cosmos/cosmosFeeCoinDenom';
import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { Endpoint } from '../../Endpoint';
import { RpcServiceCosmos } from '../cosmos/RpcServiceCosmos';

export class RpcServiceTerraV2 extends RpcServiceCosmos {
  async getBalance(coin: Coin): Promise<string> {
    if (
      coin.isNativeToken ||
      (!coin.isNativeToken && coin.contractAddress.includes('ibc/')) ||
      (!coin.isNativeToken && coin.contractAddress.includes('factory/')) ||
      (!coin.isNativeToken && !coin.contractAddress.includes('terra'))
    ) {
      return await this.getTokenBalance(coin);
    } else {
      return await this.fetchWasmTokenBalances(coin);
    }
  }

  async getTokenBalance(coin: Coin): Promise<string> {
    const balances = await this.fetchBalances(coin.address);
    const denom = cosmosFeeCoinDenom[this.chain];

    const balance = balances.find(balance => {
      if (coin.isNativeToken) {
        if (balance.denom.toLowerCase() === denom) {
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
    } catch {
      return '0';
    }

    if (!url) {
      return '0';
    }

    let response;
    try {
      response = await fetch(url);
    } catch {
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
  async getBalance(coin: Coin): Promise<string> {
    if (
      coin.isNativeToken ||
      (!coin.isNativeToken && coin.contractAddress.includes('ibc/')) ||
      (!coin.isNativeToken && coin.contractAddress.includes('factory/')) ||
      (!coin.isNativeToken && !coin.contractAddress.includes('terra'))
    ) {
      return await this.getTokenBalance(coin);
    } else {
      return await this.fetchWasmTokenBalances(coin);
    }
  }

  async getTokenBalance(coin: Coin): Promise<string> {
    const balances = await this.fetchBalances(coin.address);
    const denom = cosmosFeeCoinDenom[this.chain];

    const balance = balances.find(balance => {
      if (coin.isNativeToken) {
        if (balance.denom.toLowerCase() === denom) {
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
    } catch {
      return '0';
    }

    if (!url) {
      return '0';
    }

    let response;
    try {
      response = await fetch(url);
    } catch {
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
