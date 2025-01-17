import {
  getCosmosBalanceUrl,
  getCosmosTxBroadcastUrl,
} from '../../../chain/cosmos/cosmosRpcUrl';
import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { Chain } from '../../../model/chain';
import { Endpoint } from '../../Endpoint';
import { IRpcService } from '../IRpcService';

export class RpcServiceThorchain implements IRpcService {
  async getBalance(coin: Coin): Promise<string> {
    const url = getCosmosBalanceUrl({
      chain: Chain.THORChain,
      address: coin.address,
    });
    const response = await fetch(url, {
      headers: {
        'X-Client-ID': 'vultisig',
      },
    });

    const data = await response.json();

    return (
      data?.balances?.find(
        (b: any) => b.denom.toLowerCase() === coin.ticker.toLowerCase()
      )?.amount ?? 0
    );
  }

  async broadcastTransaction(hex: string): Promise<string> {
    const url = getCosmosTxBroadcastUrl(Chain.THORChain);

    // fetch to post the transaction
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: hex,
    });

    const data = await response.json();
    return data.tx_response?.txhash;
  }

  static async getTHORChainChainID(): Promise<string> {
    const urlString = Endpoint.thorchainNetworkInfo;
    const response = await fetch(urlString);
    const data = await response.json();
    const network = data.result.node_info.network;

    return network;
  }
}
