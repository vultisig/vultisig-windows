import { getCosmosBalanceUrl } from '../../../chain/cosmos/cosmosRpcUrl';
import { Coin } from '@core/communication/vultisig/keysign/v1/coin_pb';
import { Chain } from '../../../model/chain';
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
}
