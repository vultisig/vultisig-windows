import { getCosmosBalanceUrl } from '../../../chain/cosmos/cosmosRpcUrl';
import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { CosmosChain } from '../../../model/chain';
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
}
