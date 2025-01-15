import {
  getCosmosBalanceUrl,
  getCosmosTxBroadcastUrl,
} from '../../../chain/cosmos/cosmosRpcUrl';
import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { Chain, CosmosChain } from '../../../model/chain';
import { IRpcService } from '../IRpcService';

export class RpcServiceMaya implements IRpcService {
  async getBalance(coin: Coin): Promise<string> {
    const url = getCosmosBalanceUrl({
      chain: coin.chain as CosmosChain,
      address: coin.address,
    });

    const response = await fetch(url);

    const data = await response.json();

    return (
      data?.balances?.find(
        (b: any) => b.denom.toLowerCase() === coin.ticker.toLowerCase()
      )?.amount ?? 0
    );
  }

  async broadcastTransaction(hex: string): Promise<string> {
    const url = getCosmosTxBroadcastUrl(Chain.MayaChain);

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
}
