import { Fetch, Post } from '../../../../wailsjs/go/utils/GoHttp';
import { cosmosFeeCoinDenom } from '../../../chain/cosmos/cosmosFeeCoinDenom';
import {
  getCosmosBalanceUrl,
  getCosmosTxBroadcastUrl,
} from '../../../chain/cosmos/cosmosRpcUrl';
import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { shouldBePresent } from '../../../lib/utils/assert/shouldBePresent';
import { CosmosChain } from '../../../model/chain';
import { IRpcService } from '../IRpcService';

export class RpcServiceCosmos implements IRpcService {
  chain: CosmosChain;

  constructor(chain: CosmosChain) {
    this.chain = chain;
  }

  async getBalance(coin: Coin): Promise<string> {
    const balances = await this.fetchBalances(coin.address);
    const denom = cosmosFeeCoinDenom[coin.chain as CosmosChain];
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

  async fetchBalances(address: string): Promise<CosmosBalance[]> {
    const url = getCosmosBalanceUrl({
      chain: this.chain,
      address,
    });

    const response: CosmosBalanceResponse = await Fetch(url);
    return response.balances;
  }

  async broadcastTransaction(jsonString: string): Promise<string> {
    const url = getCosmosTxBroadcastUrl(this.chain as CosmosChain);

    const response = await Post(url, JSON.parse(jsonString));

    const data: CosmosTransactionBroadcastResponse = response;

    if (
      data.tx_response?.raw_log &&
      data.tx_response?.raw_log !== '' &&
      data.tx_response?.raw_log !== '[]'
    ) {
      return data.tx_response.raw_log;
    }

    return shouldBePresent(data.tx_response?.txhash);
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
