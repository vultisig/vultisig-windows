import { Fetch } from '../../../../wailsjs/go/utils/GoHttp';
import { cosmosFeeCoinDenom } from '../../../chain/cosmos/cosmosFeeCoinDenom';
import { getCosmosBalanceUrl } from '../../../chain/cosmos/cosmosRpcUrl';
import { Coin } from '@core/communication/vultisig/keysign/v1/coin_pb';
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
}

interface CosmosBalance {
  amount: string;
  denom: string;
}

interface CosmosBalanceResponse {
  balances: CosmosBalance[];
}
